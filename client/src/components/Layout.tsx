import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { ShoppingCart, Leaf } from 'lucide-react';
import { MiniCartDrawer } from './MiniCartDrawer';

export const Layout: React.FC = () => {
  const { t, lang, toggleLang } = useLanguage();
  const { cart, setDrawerOpen } = useCart();
  const { settings } = useSettings();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-surface backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-2xl">
            <Leaf className="w-8 h-8" />
            <span>freshagro.farm</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-medium">
            <a href="/#combos" className="hover:text-primary transition-colors">{t('home.shop_combos')}</a>
            <a href="/#how-it-works" className="hover:text-primary transition-colors">{t('home.how_it_works')}</a>
            <a href="/#why-us" className="hover:text-primary transition-colors">{t('home.why_us')}</a>
            <a href="#footer" className="hover:text-primary transition-colors">{t('home.contact')}</a>
            <Link to="/track-order" id="nav-track-order" className="px-4 py-1.5 rounded-full bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
              {lang === 'en' ? 'Track Order' : 'অর্ডার ট্র্যাক'}
            </Link>
          </nav>

          <Link to="/track-order" id="nav-track-order-mobile" className="md:hidden ml-auto mr-2 px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold">
            {lang === 'en' ? 'Track Order' : 'অর্ডার ট্র্যাক'}
          </Link>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDrawerOpen(true)}
              className="relative p-2 text-slate-700 hover:text-primary transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-highlight text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            
            <button 
              onClick={toggleLang}
              className="px-3 py-1 bg-white/50 rounded-full text-sm font-semibold border border-slate-200"
            >
              {lang === 'en' ? 'বাংলা / EN' : 'EN / বাংলা'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer id="footer" className="bg-slate-900 text-slate-300 py-12 mt-20">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <Leaf className="w-6 h-6 text-primary" />
              <span>freshagro.farm</span>
            </div>
            <p className="opacity-80">{lang === 'en' ? 'Farm-fresh grocery combos delivered directly to your door.' : 'খামার-তাজা গ্রোসারি কমবো সরাসরি আপনার দরজায়।'}</p>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{t('home.contact')}</h3>
            {settings && (
              <ul className="space-y-2 opacity-80">
                <li>{lang === 'en' ? 'Phone' : 'ফোন'}: {settings.site_phone}</li>
                <li>{lang === 'en' ? 'WhatsApp' : 'হোয়াটসঅ্যাপ'}: {settings.site_whatsapp}</li>
                <li>{lang === 'en' ? 'Email' : 'ইমেইল'}: {settings.site_email}</li>
                <li>{lang === 'en' ? settings.site_address_en : settings.site_address_bn}</li>
              </ul>
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{lang === 'en' ? 'Payment Methods' : 'পেমেন্ট পদ্ধতি'}</h3>
            <div className="flex gap-4 opacity-80">
              <span className="bg-slate-800 px-3 py-1 rounded">{lang === 'en' ? 'bKash' : 'বিকাশ'}</span>
              <span className="bg-slate-800 px-3 py-1 rounded">{lang === 'en' ? 'Nagad' : 'নগদ'}</span>
              <span className="bg-slate-800 px-3 py-1 rounded">{lang === 'en' ? 'Cash on Delivery' : 'ক্যাশ অন ডেলিভারি'}</span>
            </div>
          </div>
        </div>
      </footer>
      <MiniCartDrawer />
    </div>
  );
};
