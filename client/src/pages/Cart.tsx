import React, { useEffect, useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { useCheckout } from '../context/CheckoutContext';
import { apiClient, useFetch, ApiError } from '../api/client';
import { Combo, QuoteResponse } from '@freshagro/shared';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, setQuantity, removeFromCart } = useCart();
  const { t, lang, formatCurrency, pickField } = useLanguage();
  const { settings } = useSettings();
  const { setSource, couponCode, setCouponCode, setQuote: setGlobalQuote } = useCheckout();
  const navigate = useNavigate();

  const { data: combos } = useFetch<Combo[]>('/combos');

  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [couponInput, setCouponInput] = useState(couponCode);
  const [couponError, setCouponError] = useState<string | null>(null);
  
  const latestRequestRef = useRef<number>(0);

  const fetchQuote = async (code: string) => {
    if (cart.length === 0) {
      setQuote(null);
      return;
    }
    setLoadingQuote(true);
    setCouponError(null);
    const reqId = ++latestRequestRef.current;

    try {
      const res = await apiClient<QuoteResponse>('/cart/quote', {
        method: 'POST',
        body: JSON.stringify({
          items: cart.map(i => ({ comboId: i.comboId, quantity: i.quantity })),
          deliveryZone: 'inside_dhaka',
          couponCode: code || undefined,
        })
      });
      if (reqId === latestRequestRef.current) {
        setQuote(res);
        setGlobalQuote(res);
      }
    } catch (err: unknown) {
      if (reqId === latestRequestRef.current) {
        const error = err as Error | ApiError;
        if ('code' in error && error.code?.startsWith('COUPON_')) {
          setCouponError(error.message);
          setCouponCode('');
        }
        setQuote(null);
      }
    } finally {
      if (reqId === latestRequestRef.current) {
        setLoadingQuote(false);
      }
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchQuote(couponCode), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, couponCode]);

  const handleApplyCoupon = () => {
    setCouponCode(couponInput.trim().toUpperCase());
  };

  const handleCheckout = () => {
    if (quote?.lines.some(i => !combos?.find(c => c.id === i.comboId))) {
      alert('Please remove unavailable items before proceeding.');
      return;
    }
    setSource('cart');
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <GlassCard className="max-w-md mx-auto p-10 flex flex-col items-center">
          <span className="text-8xl mb-6">🛒</span>
          <h2 className="text-2xl font-bold mb-4">{lang === 'en' ? 'Your cart is empty' : 'আপনার কার্ট খালি'}</h2>
          <Link to="/">
            <Button>{t('home.shop_combos')}</Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  const freeDeliveryRemaining = quote?.freeDeliveryRemaining ?? (settings?.free_delivery_min_amount ?? 0);
  const progressPercent = settings ? Math.min(100, Math.max(0, 100 - (freeDeliveryRemaining / settings.free_delivery_min_amount) * 100)) : 0;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">{lang === 'en' ? 'Shopping Cart' : 'শপিং কার্ট'}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          {cart.map(item => {
            const combo = combos?.find(c => c.id === item.comboId);
            const quoteItem = quote?.lines.find(i => i.comboId === item.comboId);
            
            if (!combo) return null;
            
            const isUnavailable = quote && !quoteItem;

            return (
              <GlassCard key={item.comboId} className={`p-4 flex gap-6 ${isUnavailable ? 'opacity-60 grayscale' : ''}`}>
                <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {combo.image_url ? (
                    <img src={combo.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{pickField<string>(combo, 'name')}</h3>
                      <p className="text-sm text-slate-500 line-clamp-1 mt-1">
                        {combo.items?.map(i => pickField<string>(i, 'name')).join(', ')}
                      </p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.comboId)}
                      className="text-slate-400 hover:text-red-500 p-2"
                      title={t('common.remove')}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {isUnavailable ? (
                    <div className="text-red-500 font-semibold text-sm mt-2">
                      Currently Unavailable
                      <button onClick={() => removeFromCart(item.comboId)} className="ml-2 underline">Remove</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-xl font-bold text-primary">
                        {formatCurrency(combo.price)}
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 rounded-full px-3 py-1 border border-slate-200">
                        <button 
                          onClick={() => setQuantity(item.comboId, item.quantity - 1)}
                          className="text-slate-500 hover:text-primary disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold w-6 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => setQuantity(item.comboId, item.quantity + 1)}
                          disabled={item.quantity >= 20}
                          className="text-slate-500 hover:text-primary disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 sticky top-28 bg-white/60">
            <h2 className="text-xl font-bold mb-6">{lang === 'en' ? 'Order Summary' : 'অর্ডার সারসংক্ষেপ'}</h2>

            {settings && (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between text-sm font-semibold mb-2 text-slate-600">
                  <span>{t('common.free_delivery_over')} {formatCurrency(settings.free_delivery_min_amount)}</span>
                  {freeDeliveryRemaining > 0 ? (
                    <span className="text-highlight">
                      {t('common.micro_free_delivery', { amount: formatCurrency(freeDeliveryRemaining) })}
                    </span>
                  ) : (
                    <span className="text-primary">Free Delivery! 🚚</span>
                  )}
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3 mb-6 text-slate-600">
              <div className="flex justify-between">
                <span>{t('common.subtotal')}</span>
                <span className="font-semibold">{quote ? formatCurrency(quote.subtotal) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('common.delivery_charge')}</span>
                <span className="font-semibold">{quote ? formatCurrency(quote.deliveryCharge) : '-'}</span>
              </div>
              {quote && quote.discountAmount > 0 && (
                <div className="flex justify-between text-highlight font-medium">
                  <span>{t('common.discount')} ({quote.appliedCoupon})</span>
                  <span>-{formatCurrency(quote.discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">{t('common.total')}</span>
                <span className="text-2xl font-bold text-primary">
                  {loadingQuote ? <span className="text-sm text-slate-400">...</span> : (quote ? formatCurrency(quote.grandTotal) : '-')}
                </span>
              </div>
            </div>

            {/* Coupon */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  placeholder="Coupon code"
                  className="pill-input uppercase"
                />
                <Button variant="outline" onClick={handleApplyCoupon} className="px-4 shrink-0">
                  {t('common.apply')}
                </Button>
              </div>
              {couponError && <p className="text-red-500 text-sm mt-2 ml-4">{couponError}</p>}
              {quote?.discountAmount ? quote.discountAmount > 0 && <p className="text-primary text-sm mt-2 ml-4">Coupon applied successfully!</p> : null}
            </div>

            <Button 
              className="w-full py-4 text-lg group" 
              onClick={handleCheckout}
              disabled={loadingQuote || !quote || quote.lines.some(i => !combos?.find(c => c.id === i.comboId))}
            >
              <span>{t('common.checkout')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
