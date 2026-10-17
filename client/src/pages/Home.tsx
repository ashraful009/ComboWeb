import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { useCheckout } from '../context/CheckoutContext';
import { useFetch } from '../api/client';
import { Combo } from '@freshagro/shared';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import bannerImage from '../assets/banner.png';
import trustBannerImage from '../assets/brand-trust-banner.jpg';

export const Home: React.FC = () => {
  const { t, pickField } = useLanguage();
  const { settings } = useSettings();
  const { addToCart } = useCart();
  const { setSource, setBuyNowComboId, setBuyNowQuantity } = useCheckout();
  const navigate = useNavigate();

  const { data: combos, loading, error, refetch } = useFetch<Combo[]>('/combos');

  const handleBuyNow = (comboId: number) => {
    setSource('buy-now');
    setBuyNowComboId(comboId);
    setBuyNowQuantity(1);
    navigate('/checkout');
  };

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative w-full aspect-[9/3] bg-gradient-to-br from-green-50 to-blue-50 overflow-hidden">
        <img 
          src={bannerImage} 
          alt="Hero banner" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 flex flex-col justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          </div>
        </div>
      </section>

      {/* Combos Section */}
      <section id="combos" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">{t('home.combos_title')}</h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-8">
            {[1, 2].map(i => (
              <GlassCard key={i} className="flex flex-col md:flex-row overflow-hidden border-white animate-pulse">
                <div className="w-full md:w-1/2 aspect-video bg-slate-200 shrink-0" />
                <div className="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="h-7 bg-slate-200 rounded-lg w-2/3" />
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                  </div>
                  <div className="h-48 bg-slate-100/70 rounded-xl w-full border border-slate-100" />
                  <div className="space-y-3 pt-2">
                    <div className="h-8 bg-slate-200 rounded-lg w-1/3" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-11 bg-slate-200 rounded-full" />
                      <div className="h-11 bg-slate-200 rounded-full" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-10 bg-red-50 rounded-2xl text-red-600">
            <p className="mb-4">{t('common.error')}: {error.message}</p>
            <Button onClick={refetch}>{t('common.retry')}</Button>
          </div>
        )}

        {combos && combos.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            No combos available right now. Please check back later!
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {combos?.map(combo => (
            <ComboCard 
              key={combo.id} 
              combo={combo} 
              onAddToCart={() => addToCart(combo.id, 1)}
              onBuyNow={() => handleBuyNow(combo.id)}
            />
          ))}
        </div>

        {/* Product Brand & Trust Assurance Banner */}
        {combos && combos.length > 0 && (
          <div className="mt-8">
            <GlassCard className="p-6 md:p-8 bg-gradient-to-r from-emerald-50/70 via-white/80 to-teal-50/60 border-emerald-100 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/90 text-primary flex items-center justify-center shrink-0 shadow-sm border border-emerald-200/50">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-slate-700 text-sm md:text-base leading-relaxed font-medium">
                    {t('home.brand_disclaimer')}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="inline-flex items-center gap-2 bg-emerald-100/80 text-emerald-800 border border-emerald-200/70 font-semibold text-xs sm:text-sm px-3.5 py-1.5 rounded-full shadow-xs">
                      <span>{t('home.payment_trust')}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600 font-medium">
                      {t('home.brand_promise')}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">{t('home.how_it_works')}</h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassCard className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 text-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">1</div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Choose Your Combo</h3>
            <p className="text-slate-600">Browse our curated selection of farm-fresh grocery combinations tailored for your family.</p>
          </GlassCard>
          <GlassCard className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 text-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">2</div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Place Your Order</h3>
            <p className="text-slate-600">Checkout easily with Cash on Delivery or secure mobile payments like bKash and Nagad.</p>
          </GlassCard>
          <GlassCard className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 text-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">3</div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Fast Delivery</h3>
            <p className="text-slate-600">Receive your fresh groceries right at your doorstep quickly and safely.</p>
          </GlassCard>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="bg-white/40 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">{t('home.why_us')}</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">🍃</div>
              <h3 className="font-bold text-slate-800 mb-2">100% Fresh</h3>
              <p className="text-sm text-slate-600">Sourced directly from local farms ensuring top quality.</p>
            </div>
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-bold text-slate-800 mb-2">Best Prices</h3>
              <p className="text-sm text-slate-600">Combo packages save you money compared to retail.</p>
            </div>
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="font-bold text-slate-800 mb-2">Home Delivery</h3>
              <p className="text-sm text-slate-600">Convenient doorstep delivery when you need it.</p>
            </div>
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="font-bold text-slate-800 mb-2">Quality Assured</h3>
              <p className="text-sm text-slate-600">Every item is checked before it reaches you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Trust Banner Section (Above Footer) */}
      <section className="container mx-auto px-4 pt-12">
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl shadow-glass border border-white/60 bg-white">
          <img 
            src={trustBannerImage} 
            alt="FreshAgro.Farm - Direct From Farmer to Consumer" 
            className="w-full h-auto object-cover block"
            loading="lazy"
          />
        </div>
      </section>
    </div>
  );
};

const ComboCard = ({ combo, onAddToCart, onBuyNow }: { combo: Combo, onAddToCart: () => void, onBuyNow: () => void }) => {
  const { t, formatCurrency, pickField } = useLanguage();
  const saving = combo.market_price - combo.price;
  
  const tag = pickField<string | null>(combo, 'tag');
  
  return (
    <GlassCard hover className="combo-card flex flex-col md:flex-row overflow-hidden relative border-white h-full">
      {tag && (
        <div className="absolute top-4 right-4 z-10 bg-highlight text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          {tag}
        </div>
      )}
      
      {/* Left side: Image (16:9 aspect ratio) */}
      <div className="w-full md:w-1/2 aspect-video bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 relative">
        {combo.image_url ? (
          <img src={combo.image_url} alt="" className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className="text-6xl opacity-20 relative z-10">📦</span>
        )}
      </div>

      {/* Right side: Content */}
      <div className="w-full md:w-1/2 p-6 flex flex-col flex-1">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">{pickField<string>(combo, 'name')}</h3>
        
        <div className="flex gap-4 text-sm text-slate-500 mb-4 font-medium">
          {combo.serves && <span>👥 {t('home.serves')}: {combo.serves}</span>}
          {combo.weight_label && <span>⚖️ {combo.weight_label}</span>}
        </div>

        {/* Product List */}
        <div className="flex-1 bg-white/50 rounded-xl p-4 mb-6 border border-slate-100 overflow-x-auto overflow-y-auto max-h-[300px]">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs sm:text-sm">
                <th className="pb-2 font-medium">{t('common.items')}</th>
                <th className="pb-2 font-medium text-center">{t('common.qty')}</th>
                <th className="pb-2 font-medium text-right whitespace-nowrap">{t('common.actual_price')}</th>
                <th className="pb-2 font-medium text-right whitespace-nowrap">{t('common.discounted_price')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {combo.items?.map(item => (
                <tr key={item.id} className="text-slate-700">
                  <td className="py-2 pr-2 font-medium">{pickField<string>(item, 'name')}</td>
                  <td className="py-2 px-2 text-center whitespace-nowrap text-slate-500 text-xs">{item.qty_label}</td>
                  <td className="py-2 px-2 text-right whitespace-nowrap">
                    <span className="text-xs sm:text-sm text-slate-600 font-medium">
                      {formatCurrency(item.market_price > 0 ? item.market_price : item.price)}
                    </span>
                  </td>
                  <td className="py-2 pl-2 text-right whitespace-nowrap">
                    <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                      {formatCurrency(item.price)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-auto">
          <div className="flex items-end gap-3 mb-2">
            <span className="text-3xl font-bold text-primary">{formatCurrency(combo.price)}</span>
            <span className="text-slate-400 line-through text-lg">{formatCurrency(combo.market_price)}</span>
          </div>
          
          {saving > 0 && (
            <div className="text-highlight font-semibold text-sm mb-4">
              ✨ {t('common.you_save', { amount: formatCurrency(saving) })}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={onAddToCart} variant="outline" className="w-full">
              {t('common.add_to_cart')}
            </Button>
            <Button onClick={onBuyNow} className="w-full">
              {t('common.buy_now')}
            </Button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
