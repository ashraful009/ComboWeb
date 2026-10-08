import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { useFetch, apiClient } from '../api/client';
import { QuoteResponse, Combo } from '@freshagro/shared';
import { X, Minus, Plus } from 'lucide-react';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';
import { useCheckout } from '../context/CheckoutContext';

export const MiniCartDrawer: React.FC = () => {
  const { cart, setQuantity, removeFromCart, isDrawerOpen, setDrawerOpen } = useCart();
  const { t, lang, formatCurrency, pickField } = useLanguage();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const { setSource } = useCheckout();

  const { data: combos } = useFetch<Combo[]>('/combos');

  // Debounced Quote
  const [quote, setQuote] = React.useState<QuoteResponse | null>(null);
  const [loadingQuote, setLoadingQuote] = React.useState(false);

  useEffect(() => {
    if (cart.length === 0 || !isDrawerOpen) {
      setQuote(null);
      return;
    }
    const fetchQuote = async () => {
      setLoadingQuote(true);
      try {
        const res = await apiClient<QuoteResponse>('/cart/quote', {
          method: 'POST',
          body: JSON.stringify({
            items: cart.map(i => ({ comboId: i.comboId, quantity: i.quantity })),
            deliveryZone: 'inside_dhaka' // default for quote
          })
        });
        setQuote(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingQuote(false);
      }
    };
    
    const timeout = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timeout);
  }, [cart, isDrawerOpen]);

  const handleCheckout = () => {
    setDrawerOpen(false);
    setSource('cart');
    navigate('/checkout');
  };

  const freeDeliveryRemaining = quote?.freeDeliveryRemaining ?? (settings?.free_delivery_min_amount ?? 0);
  const progressPercent = settings ? Math.min(100, Math.max(0, 100 - (freeDeliveryRemaining / settings.free_delivery_min_amount) * 100)) : 0;

  return (
    <>
      {/* Backdrop */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity" 
          onClick={() => setDrawerOpen(false)} 
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white/90 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-200">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>🛒</span> 
            {lang === 'en' ? 'Your Cart' : 'আপনার কার্ট'}
            <span className="text-sm bg-slate-100 px-2 py-1 rounded-full text-slate-500 font-normal">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} {t('common.items')}
            </span>
          </h2>
          <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
              <span className="text-6xl">🛍️</span>
              <p>{lang === 'en' ? 'Your cart is empty' : 'আপনার কার্ট খালি'}</p>
              <Button onClick={() => setDrawerOpen(false)} variant="outline">
                {t('home.shop_combos')}
              </Button>
            </div>
          ) : (
            cart.map(item => {
              const combo = combos?.find(c => c.id === item.comboId);
              if (!combo) return null;
              return (
                <div key={item.comboId} className="flex gap-4 p-3 bg-white rounded-xl shadow-sm border border-slate-100 relative group">
                  <div className="w-20 h-20 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    {combo.image_url ? (
                      <img src={combo.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-sm leading-tight pr-6">
                        {pickField<string>(combo, 'name')}
                      </h3>
                      <button 
                        onClick={() => removeFromCart(item.comboId)}
                        className="text-slate-400 hover:text-red-500 absolute top-3 right-3"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-primary font-bold">
                      {formatCurrency(combo.price)}
                    </div>
                    
                    {/* Stepper */}
                    <div className="flex items-center gap-3 mt-2 bg-slate-50 w-fit rounded-full px-2 py-1 border border-slate-200">
                      <button 
                        onClick={() => setQuantity(item.comboId, item.quantity - 1)}
                        className="text-slate-500 hover:text-primary disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => setQuantity(item.comboId, item.quantity + 1)}
                        disabled={item.quantity >= 20}
                        className="text-slate-500 hover:text-primary disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            {settings && (
              <div className="mb-4">
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600">
                  <span>{t('common.free_delivery_over')} {formatCurrency(settings.free_delivery_min_amount)}</span>
                  {freeDeliveryRemaining > 0 ? (
                    <span className="text-highlight">
                      {t('common.micro_free_delivery', { amount: formatCurrency(freeDeliveryRemaining) })}
                    </span>
                  ) : (
                    <span className="text-primary">Free Delivery Unlocked! 🚚</span>
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

            <div className="flex justify-between items-end mb-4">
              <span className="text-slate-500 font-medium">{t('common.subtotal')}</span>
              <div className="text-right">
                {loadingQuote && <div className="text-xs text-slate-400">calculating...</div>}
                <span className="text-2xl font-bold">{quote ? formatCurrency(quote.subtotal) : '-'}</span>
              </div>
            </div>

            <Button className="w-full py-4 text-lg" onClick={handleCheckout}>
              {t('common.checkout')}
            </Button>
            <Button variant="ghost" className="w-full mt-2" onClick={() => { setDrawerOpen(false); navigate('/cart'); }}>
              View Full Cart
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
