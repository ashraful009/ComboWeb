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
import bannerImage from '../assets/banner.png';

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
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        
        <div className="absolute inset-0 bg-black/20 flex flex-col justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <GlassCard className="max-w-2xl p-8 sm:p-12 !bg-white/40 border-white/60">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 leading-tight drop-shadow-sm">
                {settings ? pickField<string>(settings, 'hero_title') : 'FreshAgro'}
              </h1>
              <p className="text-xl sm:text-2xl text-slate-800 mb-8 font-medium">
                {settings ? pickField<string>(settings, 'hero_subtitle') : 'Farm-fresh grocery combos, delivered directly to your door!'}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => document.getElementById('combos')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 text-lg">
                  {t('home.shop_combos')}
                </Button>
                <Button variant="outline" className="px-8 py-4 text-lg !bg-white/50">
                  {t('home.how_it_works')}
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-6 text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-primary text-xl">✓</span> 100% Fresh
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary text-xl">🚚</span> Cash on Delivery
                </div>
              </div>
            </GlassCard>
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <GlassCard key={i} className="h-[500px] animate-pulse bg-white/50" />
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {combos?.map(combo => (
            <ComboCard 
              key={combo.id} 
              combo={combo} 
              onAddToCart={() => addToCart(combo.id, 1)}
              onBuyNow={() => handleBuyNow(combo.id)}
            />
          ))}
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
      
      {/* Left side: Image (3:4 aspect ratio) */}
      <div className="w-full md:w-2/5 aspect-[3/4] bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 relative">
        {combo.image_url ? (
          <img src={combo.image_url} alt="" className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className="text-6xl opacity-20 relative z-10">📦</span>
        )}
      </div>

      {/* Right side: Content */}
      <div className="w-full md:w-3/5 p-6 flex flex-col flex-1">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">{pickField<string>(combo, 'name')}</h3>
        
        <div className="flex gap-4 text-sm text-slate-500 mb-4 font-medium">
          {combo.serves && <span>👥 {t('home.serves')}: {combo.serves}</span>}
          {combo.weight_label && <span>⚖️ {combo.weight_label}</span>}
        </div>

        {/* Product List */}
        <div className="flex-1 bg-white/50 rounded-xl p-4 mb-6 border border-slate-100 overflow-y-auto max-h-[300px]">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2 font-medium">{t('common.items')}</th>
                <th className="pb-2 font-medium text-center">{t('common.qty')}</th>
                <th className="pb-2 font-medium text-right">{t('common.price')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {combo.items?.map(item => (
                <tr key={item.id} className="text-slate-700">
                  <td className="py-2 pr-2 font-medium">{pickField<string>(item, 'name')}</td>
                  <td className="py-2 px-2 text-center whitespace-nowrap text-slate-500 text-xs">{item.qty_label}</td>
                  <td className="py-2 pl-2 text-right whitespace-nowrap">
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-slate-800">{formatCurrency(item.price)}</span>
                      {item.market_price > item.price && (
                        <span className="text-xs text-slate-400 line-through">{formatCurrency(item.market_price)}</span>
                      )}
                    </div>
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
