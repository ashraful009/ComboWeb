import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { useCheckout } from '../context/CheckoutContext';
import { useFetch, apiClient, ApiError } from '../api/client';
import { Combo, QuoteResponse, CreateOrderRequest } from '@freshagro/shared';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { bdGeoData } from '../utils/bd_geodata';

export const Checkout: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { lang, formatCurrency, pickField } = useLanguage();
  const { settings } = useSettings();
  const { 
    source, couponCode, deliveryZone, setDeliveryZone, 
    buyNowComboId, buyNowQuantity 
  } = useCheckout();
  const navigate = useNavigate();

  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  
  const { data: combos } = useFetch<Combo[]>('/combos');

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [thana, setThana] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [bkashNumber, setBkashNumber] = useState('');
  const [bkashTxnId, setBkashTxnId] = useState('');
  const [nagadNumber, setNagadNumber] = useState('');
  const [nagadTxnId, setNagadTxnId] = useState('');
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select zone based on district
  useEffect(() => {
    if (district === 'dhaka') {
      setDeliveryZone('inside_dhaka');
    } else if (district) {
      setDeliveryZone('outside_dhaka');
    }
  }, [district, setDeliveryZone]);

  const itemsToQuote = source === 'buy-now' && buyNowComboId 
    ? [{ comboId: buyNowComboId, quantity: buyNowQuantity }]
    : cart.map(i => ({ comboId: i.comboId, quantity: i.quantity }));

  // Refetch quote on zone change
  const latestReqRef = useRef(0);
  useEffect(() => {
    if (itemsToQuote.length === 0) {
      navigate('/');
      return;
    }
    const fetchQuote = async () => {
      setLoadingQuote(true);
      setQuoteError(null);
      const reqId = ++latestReqRef.current;
      try {
        const res = await apiClient<QuoteResponse>('/cart/quote', {
          method: 'POST',
          body: JSON.stringify({
            items: itemsToQuote,
            deliveryZone,
            couponCode: couponCode || undefined
          })
        });
        if (reqId === latestReqRef.current) setQuote(res);
      } catch (err: unknown) {
        if (reqId === latestReqRef.current) {
          setQuote(null);
          setQuoteError((err as Error).message);
        }
      } finally {
        if (reqId === latestReqRef.current) setLoadingQuote(false);
      }
    };
    fetchQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryZone, couponCode]); 

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      alert('Please agree to the terms and policies.');
      return;
    }
    if (!quote) return;
    if (quote.lines.some(i => !combos?.find(c => c.id === i.comboId))) {
      alert('Some items are unavailable.');
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const payload: CreateOrderRequest = {
      items: itemsToQuote,
      customer_name: name,
      phone: phone,
      email: email || undefined,
      division: division,
      district: district,
      area: thana,
      address: address,
      delivery_note: note || undefined,
      delivery_slot: timeSlot || undefined,
      delivery_zone: deliveryZone,
      coupon_code: couponCode || undefined,
      payment_method: paymentMethod,
    };

    if (paymentMethod === 'bkash') {
      payload.payment_sender_number = bkashNumber;
      payload.payment_txn_id = bkashTxnId;
    } else if (paymentMethod === 'nagad') {
      payload.payment_sender_number = nagadNumber;
      payload.payment_txn_id = nagadTxnId;
    }

    try {
      const res = await apiClient<{ publicToken: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (source === 'cart') clearCart();
      navigate(`/order/${res.publicToken}`);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
        // Scroll to top to see errors
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert((err as Error).message || 'Failed to place order');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (path: string) => {
    return fieldErrors[path] ? <span className="text-red-500 text-xs ml-2">{fieldErrors[path]}</span> : null;
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">{lang === 'en' ? 'Checkout' : 'চেকআউট (Checkout Page)'}</h1>
      
      {quoteError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
          Error loading quote: {quoteError}. Please return to cart and resolve any issues.
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Details */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">১. আপনার তথ্য (Customer Details)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">আপনার নাম (Full Name) * {getFieldError('customer_name')}</label>
                <input required type="text" name="customer_name" value={name} onChange={e => setName(e.target.value)} className="pill-input rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">মোবাইল নম্বর (BD format) * {getFieldError('customer_phone')}</label>
                <input required type="text" name="phone" placeholder="01XXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} className="pill-input rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">ইমেইল (Email - Optional) {getFieldError('customer_email')}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="pill-input rounded-lg" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">বিভাগ (Division) * {getFieldError('delivery_division')}</label>
                <select required name="division" value={division} onChange={e => { setDivision(e.target.value); setDistrict(''); }} className="pill-input rounded-lg bg-white">
                  <option value="">Select Division</option>
                  {bdGeoData.divisions.map(d => <option key={d.id} value={d.name}>{lang === 'en' ? d.name : d.bn_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">জেলা (District) * {getFieldError('delivery_district')}</label>
                <select required name="district" disabled={!division} value={district} onChange={e => setDistrict(e.target.value)} className="pill-input rounded-lg bg-white disabled:opacity-50">
                  <option value="">Select District</option>
                  {division && (bdGeoData.districts as Record<string, {id: string, name: string, bn_name: string}[]>)[bdGeoData.divisions.find(d => d.name === division)?.id || '']?.map(d => 
                    <option key={d.id} value={d.name}>{lang === 'en' ? d.name : d.bn_name}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">থানা/এলাকা (Thana/Area) * {getFieldError('delivery_thana')}</label>
                <input required type="text" name="thana" value={thana} onChange={e => setThana(e.target.value)} className="pill-input rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ডেলিভারির সময় (Preferred Time Slot) {getFieldError('delivery_time_slot')}</label>
                <select value={timeSlot} onChange={e => setTimeSlot(e.target.value)} className="pill-input rounded-lg bg-white">
                  <option value="">Any Time</option>
                  {settings?.delivery_time_slots && settings.delivery_time_slots.map((slot: string, i: number) => 
                    <option key={i} value={slot}>{slot}</option>
                  )}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">বিস্তারিত ঠিকানা (Detailed Address) * {getFieldError('delivery_address')}</label>
                <textarea required name="address" value={address} onChange={e => setAddress(e.target.value)} className="pill-input rounded-lg min-h-[80px] w-full p-3 resize-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">ডেলিভারি নোট (Delivery Note - optional) {getFieldError('delivery_note')}</label>
                <input type="text" value={note} onChange={e => setNote(e.target.value)} className="pill-input rounded-lg" />
              </div>
            </div>
          </GlassCard>

          {/* Delivery Method */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">২. ডেলিভারি পদ্ধতি (Delivery Method)</h2>
            <div className="flex gap-4">
              <label className={`flex-1 p-4 border rounded-xl flex items-center gap-2 cursor-pointer transition-colors ${deliveryZone === 'inside_dhaka' ? 'border-primary bg-primary/5' : 'border-slate-200 opacity-60'}`}>
                <input type="radio" checked={deliveryZone === 'inside_dhaka'} readOnly className="text-primary focus:ring-primary" />
                <span className="font-medium">ঢাকা সিটির ভেতরে (Inside Dhaka) - {formatCurrency(settings?.delivery_charge_inside_dhaka || 0)}</span>
              </label>
              <label className={`flex-1 p-4 border rounded-xl flex items-center gap-2 cursor-pointer transition-colors ${deliveryZone === 'outside_dhaka' ? 'border-primary bg-primary/5' : 'border-slate-200 opacity-60'}`}>
                <input type="radio" checked={deliveryZone === 'outside_dhaka'} readOnly className="text-primary focus:ring-primary" />
                <span className="font-medium">ঢাকা সিটির বাইরে (Outside Dhaka) - {formatCurrency(settings?.delivery_charge_outside_dhaka || 0)}</span>
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-2 ml-1">Delivery zone is auto-selected based on your chosen district.</p>
          </GlassCard>

          {/* Payment Method */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">৩. পেমেন্ট পদ্ধতি (Payment Method) {getFieldError('payment_method')}</h2>
            <div className="space-y-4">
              
              {/* bKash */}
              <div className={`border rounded-xl transition-colors overflow-hidden ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-slate-200'}`}>
                <label className="flex items-center gap-3 p-4 cursor-pointer">
                  <input type="radio" name="payment" value="bkash" checked={paymentMethod === 'bkash'} onChange={() => setPaymentMethod('bkash')} className="text-pink-500 focus:ring-pink-500" />
                  <span className="font-bold text-pink-600">bKash</span>
                </label>
                {paymentMethod === 'bkash' && (
                  <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-pink-100 pt-4">
                    <div className="md:col-span-2 text-sm text-slate-600">
                      Send payment to our merchant number: <strong className="text-pink-600 text-lg">{settings?.bkash_number}</strong>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">bKash Number * {getFieldError('payment_sender_number')}</label>
                      <input type="text" required value={bkashNumber} onChange={e => setBkashNumber(e.target.value)} className="pill-input rounded-lg w-full bg-white" placeholder="01XXXXXXXXX" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Transaction ID * {getFieldError('payment_transaction_id')}</label>
                      <input type="text" required value={bkashTxnId} onChange={e => setBkashTxnId(e.target.value)} className="pill-input rounded-lg w-full bg-white" placeholder="TRX12345678" />
                    </div>
                  </div>
                )}
              </div>

              {/* Nagad */}
              <div className={`border rounded-xl transition-colors overflow-hidden ${paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50' : 'border-slate-200'}`}>
                <label className="flex items-center gap-3 p-4 cursor-pointer">
                  <input type="radio" name="payment" value="nagad" checked={paymentMethod === 'nagad'} onChange={() => setPaymentMethod('nagad')} className="text-orange-500 focus:ring-orange-500" />
                  <span className="font-bold text-orange-600">Nagad</span>
                </label>
                {paymentMethod === 'nagad' && (
                  <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-orange-100 pt-4">
                    <div className="md:col-span-2 text-sm text-slate-600">
                      Send payment to our merchant number: <strong className="text-orange-600 text-lg">{settings?.nagad_number}</strong>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Nagad Number * {getFieldError('payment_sender_number')}</label>
                      <input type="text" required value={nagadNumber} onChange={e => setNagadNumber(e.target.value)} className="pill-input rounded-lg w-full bg-white" placeholder="01XXXXXXXXX" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Transaction ID * {getFieldError('payment_transaction_id')}</label>
                      <input type="text" required value={nagadTxnId} onChange={e => setNagadTxnId(e.target.value)} className="pill-input rounded-lg w-full bg-white" placeholder="TRX12345678" />
                    </div>
                  </div>
                )}
              </div>

              {/* COD */}
              <label className={`border rounded-xl flex items-center gap-3 p-4 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="text-primary focus:ring-primary" />
                <span className="font-bold text-slate-700">ক্যাশ অন ডেলিভারি (Cash on Delivery)</span>
              </label>

            </div>
          </GlassCard>
        </div>

        {/* Right Sidebar - Order Summary */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 sticky top-28">
            <h2 className="text-xl font-bold mb-4">অর্ডার সারসংক্ষেপ (Order Summary)</h2>
            
            <div className="space-y-4 mb-6 text-sm">
              {itemsToQuote.map(item => {
                const combo = combos?.find(c => c.id === item.comboId);
                const price = combo?.price || 0;
                return (
                  <div key={item.comboId} className="flex justify-between items-start pb-2 border-b border-slate-100">
                    <div className="pr-4">
                      <div className="font-medium text-slate-800">{combo ? pickField<string>(combo, 'name') : 'Loading...'}</div>
                      <div className="text-slate-500">x {lang === 'en' ? item.quantity : String(item.quantity).replace(/\d/g, d => ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'][parseInt(d)])}</div>
                    </div>
                    <div className="font-semibold">{formatCurrency(price * item.quantity)}</div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 mb-6 text-slate-600 text-sm">
              <div className="flex justify-between">
                <span>সাবটোটাল (Subtotal)</span>
                <span className="font-semibold">{quote ? formatCurrency(quote.subtotal) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ (Delivery Charge)</span>
                <span className="font-semibold">{quote ? formatCurrency(quote.deliveryCharge) : '-'}</span>
              </div>
              {quote && quote.discountAmount > 0 && (
                <div className="flex justify-between text-highlight font-medium">
                  <span>ডিসকাউন্ট (Discount)</span>
                  <span>-{formatCurrency(quote.discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-bold">সর্বমোট (Grand Total)</span>
                <span className="text-xl font-bold text-primary">
                  {loadingQuote ? '...' : (quote ? formatCurrency(quote.grandTotal) : '-')}
                </span>
              </div>
            </div>

            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input type="checkbox" required checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-1 text-primary focus:ring-primary rounded" />
              <span className="text-xs text-slate-600">
                আমি শর্তাবলী ও রিটার্ন পলিসি মেনে নিচ্ছি (I agree to terms & policies)
              </span>
            </label>

            <Button 
              type="submit" 
              className="w-full py-4 text-lg" 
              disabled={isSubmitting || loadingQuote || !quote || !termsAccepted}
              isLoading={isSubmitting}
            >
              অর্ডার প্লেস করুন (Place Order)
            </Button>
          </GlassCard>
        </div>

      </form>
    </div>
  );
};
