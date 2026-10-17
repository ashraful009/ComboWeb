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
import { bdDistricts } from '../utils/bd_geodata';
import { MapPin } from 'lucide-react';
import { MapLocationPicker } from '../components/MapLocationPicker';

export const Checkout: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { lang, formatCurrency, pickField } = useLanguage();
  const tr = (en: string, bn: string) => (lang === 'en' ? en : bn);
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
  const [district, setDistrict] = useState('Dhaka');
  const [thana, setThana] = useState('');
  const [mapAddress, setMapAddress] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  
  const [phoneError, setPhoneError] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [bkashNumber, setBkashNumber] = useState('');
  const [bkashTxnId, setBkashTxnId] = useState('');
  const [nagadNumber, setNagadNumber] = useState('');
  const [nagadTxnId, setNagadTxnId] = useState('');
  
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhone = (num: string): boolean => {
    const trimmed = num.trim();
    if (!trimmed) {
      setPhoneError(tr('Mobile number is required', 'মোবাইল নম্বর আবশ্যক'));
      return false;
    }
    const bdRegex = /^01[3-9]\d{8}$/;
    if (!bdRegex.test(trimmed)) {
      setPhoneError(
        tr(
          'Please enter a valid 11-digit BD mobile number (e.g. 017XXXXXXXX)',
          'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'
        )
      );
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 11);
    setPhone(cleaned);
    if (phoneTouched) {
      validatePhone(cleaned);
    }
  };

  const handlePhoneBlur = () => {
    setPhoneTouched(true);
    validatePhone(phone);
  };

  const handleSelectLocation = (info: { address: string; district?: string; thana?: string; lat?: number; lng?: number }) => {
    if (info.lat != null && info.lng != null) {
      setMapAddress(`https://www.google.com/maps?q=${info.lat},${info.lng}`);
    } else if (info.address) {
      setMapAddress(info.address);
    }
    setDistrict('Dhaka');
    if (info.thana) {
      setThana(info.thana);
    }
  };

  // Auto-select zone based on district (Always inside_dhaka)
  useEffect(() => {
    setDeliveryZone('inside_dhaka');
  }, [setDeliveryZone]);

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
            deliveryZone: 'inside_dhaka',
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

    setPhoneTouched(true);
    if (!validatePhone(phone)) {
      const phoneInput = document.getElementById('checkout-phone-input');
      if (phoneInput) {
        phoneInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        phoneInput.focus();
      }
      return;
    }

    if (!termsAccepted) {
      alert(tr('Please agree to the terms and policies.', 'অনুগ্রহ করে শর্তাবলী ও নীতিমালায় সম্মত হোন।'));
      return;
    }
    if (!quote) return;
    if (quote.lines.some(i => !combos?.find(c => c.id === i.comboId))) {
      alert(tr('Some items are unavailable.', 'কিছু পণ্য বর্তমানে পাওয়া যাচ্ছে না।'));
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    const combinedAddress = mapAddress.trim()
      ? `${address.trim()}\n[গুগল ম্যাপ লোকেশন: ${mapAddress.trim()}]`
      : address.trim();

    const payload: CreateOrderRequest = {
      items: itemsToQuote,
      customer_name: name,
      phone: phone,
      email: email || undefined,
      division: 'Dhaka',
      district: 'Dhaka',
      area: thana,
      address: combinedAddress,
      delivery_note: note || undefined,
      delivery_zone: 'inside_dhaka',
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
        alert((err as Error).message || tr('Failed to place order', 'অর্ডার প্লেস করা যায়নি'));
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
      <h1 className="text-3xl font-bold text-slate-800 mb-8">{lang === 'en' ? 'Checkout' : 'চেকআউট'}</h1>
      
      {quoteError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
          {tr('Error loading quote', 'কোটেশন লোড করতে সমস্যা')}: {quoteError}. {tr('Please return to cart and resolve any issues.', 'অনুগ্রহ করে কার্টে ফিরে গিয়ে সমস্যাগুলো সমাধান করুন।')}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Details */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">{tr('1. Customer Details', '১. আপনার তথ্য')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{tr('Full Name', 'আপনার নাম')} * {getFieldError('customer_name')}</label>
                <input required type="text" name="customer_name" value={name} onChange={e => setName(e.target.value)} className="pill-input rounded-lg" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700">
                    {tr('Mobile Number (BD format)', 'মোবাইল নম্বর (বিডি ফরম্যাট)')} *
                  </label>
                  {phone.length > 0 && (
                    <span className={`text-[11px] font-semibold ${phone.length === 11 && /^01[3-9]\d{8}$/.test(phone) ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {phone.length}/11 {tr('digits', 'ডিজিট')}
                    </span>
                  )}
                </div>
                <input 
                  id="checkout-phone-input"
                  required 
                  type="tel" 
                  name="phone" 
                  placeholder="01XXXXXXXXX" 
                  value={phone} 
                  onChange={e => handlePhoneChange(e.target.value)} 
                  onBlur={handlePhoneBlur}
                  className={`pill-input rounded-lg w-full transition-colors ${
                    (phoneTouched && phoneError) || fieldErrors['phone'] || fieldErrors['customer_phone']
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50/20' 
                      : phone.length === 11 && /^01[3-9]\d{8}$/.test(phone)
                      ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-200'
                      : ''
                  }`} 
                />
                {((phoneTouched && phoneError) || fieldErrors['phone'] || fieldErrors['customer_phone']) && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                    <span>⚠</span>
                    <span>{phoneError || fieldErrors['phone'] || fieldErrors['customer_phone']}</span>
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">{tr('Email (Optional)', 'ইমেইল (ঐচ্ছিক)')} {getFieldError('customer_email')}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="pill-input rounded-lg" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{tr('District', 'জেলা')} * {getFieldError('district') || getFieldError('delivery_district')}</label>
                <select 
                  required 
                  name="district" 
                  value="Dhaka" 
                  onChange={() => setDistrict('Dhaka')} 
                  className="pill-input rounded-lg bg-slate-100 text-slate-800 font-medium cursor-default"
                >
                  <option value="Dhaka">{lang === 'en' ? 'Dhaka' : 'ঢাকা'}</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {tr('Currently delivering inside Dhaka only.', 'বর্তমানে শুধুমাত্র ঢাকা জেলায় ডেলিভারি চালু রয়েছে।')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{tr('Thana/Area', 'থানা/এলাকা')} * {getFieldError('delivery_thana') || getFieldError('area')}</label>
                <input required type="text" name="thana" value={thana} onChange={e => setThana(e.target.value)} className="pill-input rounded-lg" />
              </div>

              {/* Separate Google Map Location Box */}
              <div className="md:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    {tr('Google Map Location / Address', 'গুগল ম্যাপ লোকেশন / ঠিকানা')}
                    {mapAddress && (
                      <span className="text-xs text-emerald-600 font-semibold ml-2 inline-flex items-center gap-1">
                        ✓ {tr('Location Selected', 'ম্যাপ লোকেশন যুক্ত হয়েছে')}
                      </span>
                    )}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMapOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-emerald-700 bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1.5 rounded-full transition-all shadow-xs cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{mapAddress ? tr('Change Map Location', 'ম্যাপ লোকেশন পরিবর্তন করুন') : tr('Select from Google Map', 'গুগল ম্যাপ থেকে লোকেশন সিলেক্ট করুন')}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="map_address"
                    value={mapAddress}
                    onChange={e => setMapAddress(e.target.value)}
                    placeholder={tr('Click button above to pick exact location from Google Map...', 'উপরের বাটনে ক্লিক করে গুগল ম্যাপ থেকে লোকেশন সিলেক্ট করুন (ঐচ্ছিক)...')}
                    className="pill-input rounded-lg w-full bg-slate-50/80 pr-10 text-slate-700 font-medium"
                  />
                  {mapAddress && (
                    <button
                      type="button"
                      onClick={() => setMapAddress('')}
                      title={tr('Clear map address', 'ম্যাপ লোকেশন মুছুন')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 text-sm p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {tr('Optional: Selecting from map helps our delivery team pinpoint your location.', 'ঐচ্ছিক: ম্যাপ থেকে লোকেশন সিলেক্ট করলে ডেলিভারি রাইডারের জন্য আপনার ঠিকানা খুঁজে পাওয়া সহজ হয়।')}
                </p>
              </div>

              {/* Detailed Address Box */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {tr('Detailed Address', 'বিস্তারিত ঠিকানা')} * {getFieldError('address') || getFieldError('delivery_address')}
                </label>
                <textarea 
                  required 
                  name="address" 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  placeholder={tr('House, flat/apt no, road no, block/sector, area or landmark...', 'বাসা নং, ফ্ল্যাট নং, রোড নং, ব্লক/সেক্টর, এলাকা বা নিকটস্থ ল্যান্ডমার্ক...')}
                  className="pill-input rounded-lg min-h-[75px] w-full p-3 resize-none" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">{tr('Delivery Note (optional)', 'ডেলিভারি নোট (ঐচ্ছিক)')} {getFieldError('delivery_note')}</label>
                <input type="text" value={note} onChange={e => setNote(e.target.value)} className="pill-input rounded-lg" />
              </div>
            </div>
          </GlassCard>

          {/* Delivery Method */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">{tr('2. Delivery Method', '২. ডেলিভারি পদ্ধতি')}</h2>
            <div>
              <label className="w-full p-4 border rounded-xl flex items-center gap-3 cursor-pointer transition-colors border-primary bg-primary/5">
                <input type="radio" checked readOnly className="text-primary focus:ring-primary" />
                <span className="font-medium text-slate-800">
                  {tr('Inside Dhaka', 'ঢাকা সিটির ভেতরে')} - {quote && quote.deliveryCharge === 0 ? tr('Free', 'ফ্রি') : formatCurrency(quote?.deliveryCharge ?? settings?.delivery_charge_inside_dhaka ?? 60)}
                </span>
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-2 ml-1">{tr('Delivery is inside Dhaka only.', 'বর্তমানে শুধুমাত্র ঢাকা সিটির ভেতরে ডেলিভারি কার্যকর।')}</p>
          </GlassCard>

          {/* Payment Method */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-4">{tr('3. Payment Method', '৩. পেমেন্ট পদ্ধতি')} {getFieldError('payment_method')}</h2>
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
                      {tr('Send payment to our merchant number:', 'আমাদের মার্চেন্ট নম্বরে পেমেন্ট পাঠান:')} <strong className="text-pink-600 text-lg">{settings?.bkash_number}</strong>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">{tr('bKash Number', 'বিকাশ নম্বর')} * {getFieldError('payment_sender_number')}</label>
                      <input type="text" required value={bkashNumber} onChange={e => setBkashNumber(e.target.value)} className="pill-input rounded-lg w-full bg-white" placeholder="01XXXXXXXXX" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">{tr('Transaction ID', 'ট্রানজেকশন আইডি')} * {getFieldError('payment_transaction_id')}</label>
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
                      {tr('Send payment to our merchant number:', 'আমাদের মার্চেন্ট নম্বরে পেমেন্ট পাঠান:')} <strong className="text-orange-600 text-lg">{settings?.nagad_number}</strong>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">{tr('Nagad Number', 'নগদ নম্বর')} * {getFieldError('payment_sender_number')}</label>
                      <input type="text" required value={nagadNumber} onChange={e => setNagadNumber(e.target.value)} className="pill-input rounded-lg w-full bg-white" placeholder="01XXXXXXXXX" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">{tr('Transaction ID', 'ট্রানজেকশন আইডি')} * {getFieldError('payment_transaction_id')}</label>
                      <input type="text" required value={nagadTxnId} onChange={e => setNagadTxnId(e.target.value)} className="pill-input rounded-lg w-full bg-white" placeholder="TRX12345678" />
                    </div>
                  </div>
                )}
              </div>

              {/* COD */}
              <label className={`border rounded-xl flex items-center gap-3 p-4 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="text-primary focus:ring-primary" />
                <span className="font-bold text-slate-700">{tr('Cash on Delivery', 'ক্যাশ অন ডেলিভারি')}</span>
              </label>

            </div>
          </GlassCard>
        </div>

        {/* Right Sidebar - Order Summary */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 sticky top-28">
            <h2 className="text-xl font-bold mb-4">{tr('Order Summary', 'অর্ডার সারসংক্ষেপ')}</h2>
            
            <div className="space-y-4 mb-6 text-sm">
              {itemsToQuote.map(item => {
                const combo = combos?.find(c => c.id === item.comboId);
                const price = combo?.price || 0;
                return (
                  <div key={item.comboId} className="flex justify-between items-start pb-2 border-b border-slate-100">
                    <div className="pr-4">
                      <div className="font-medium text-slate-800">{combo ? pickField<string>(combo, 'name') : tr('Loading...', 'লোড হচ্ছে...')}</div>
                      <div className="text-slate-500">x {lang === 'en' ? item.quantity : String(item.quantity).replace(/\d/g, d => ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'][parseInt(d)])}</div>
                    </div>
                    <div className="font-semibold">{formatCurrency(price * item.quantity)}</div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 mb-6 text-slate-600 text-sm">
              <div className="flex justify-between">
                <span>{tr('Subtotal', 'সাবটোটাল')}</span>
                <span className="font-semibold">{quote ? formatCurrency(quote.subtotal) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>{tr('Delivery Charge', 'ডেলিভারি চার্জ')}</span>
                <span className="font-semibold">{quote ? formatCurrency(quote.deliveryCharge) : '-'}</span>
              </div>
              {quote && quote.discountAmount > 0 && (
                <div className="flex justify-between text-highlight font-medium">
                  <span>{tr('Discount', 'ডিসকাউন্ট')}</span>
                  <span>-{formatCurrency(quote.discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-bold">{tr('Grand Total', 'সর্বমোট')}</span>
                <span className="text-xl font-bold text-primary">
                  {loadingQuote ? '...' : (quote ? formatCurrency(quote.grandTotal) : '-')}
                </span>
              </div>
            </div>

            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input type="checkbox" required checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-1 text-primary focus:ring-primary rounded" />
              <span className="text-xs text-slate-600">
                {tr('I agree to terms & policies', 'আমি শর্তাবলী ও রিটার্ন পলিসি মেনে নিচ্ছি')}
              </span>
            </label>

            <Button 
              type="submit" 
              className="w-full py-4 text-lg" 
              disabled={isSubmitting || loadingQuote || !quote || !termsAccepted}
              isLoading={isSubmitting}
            >
              {tr('Place Order', 'অর্ডার প্লেস করুন')}
            </Button>
          </GlassCard>
        </div>

      </form>

      {/* Map Location Picker Modal */}
      <MapLocationPicker
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelectLocation={handleSelectLocation}
        currentDistrict={district}
        currentThana={thana}
      />
    </div>
  );
};
