import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, PackageSearch, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api/client';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';

interface TrackedOrder {
  id: number;
  order_no: string;
  public_token: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  grand_total: number;
  created_at: string;
  updated_at: string;
  items: { name_en: string; name_bn: string; quantity: number }[];
}

const STEPS = ['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered'] as const;

const STATUS_LABELS: Record<string, { en: string; bn: string }> = {
  pending: { en: 'Placed', bn: 'অর্ডার প্লেস হয়েছে' },
  confirmed: { en: 'Confirmed', bn: 'নিশ্চিত হয়েছে' },
  packed: { en: 'Packed', bn: 'প্যাক করা হয়েছে' },
  out_for_delivery: { en: 'Out for Delivery', bn: 'ডেলিভারির পথে' },
  delivered: { en: 'Delivered', bn: 'ডেলিভারি সম্পন্ন' },
  cancelled: { en: 'Cancelled', bn: 'বাতিল' },
};

export const TrackOrder: React.FC = () => {
  const { lang, formatCurrency } = useLanguage();
  const tr = (en: string, bn: string) => (lang === 'en' ? en : bn);

  const [phone, setPhone] = useState('');
  const [searchedPhone, setSearchedPhone] = useState('');
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const reqRef = useRef(0);

  const fetchOrders = async (p: string, silent = false) => {
    const id = ++reqRef.current;
    if (!silent) { setLoading(true); setError(null); }
    try {
      const res = await apiClient<TrackedOrder[]>(`/orders/track?phone=${encodeURIComponent(p)}`);
      if (id !== reqRef.current) return;
      setOrders(res);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      if (id !== reqRef.current) return;
      if (!silent) { setOrders(null); setError((err as Error).message); }
    } finally {
      if (id === reqRef.current && !silent) setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const p = phone.trim();
    if (!p) return;
    setSearchedPhone(p);
    fetchOrders(p);
  };

  // Auto-refresh so admin status changes show up without re-searching
  useEffect(() => {
    if (!searchedPhone) return;
    const timer = setInterval(() => fetchOrders(searchedPhone, true), 30000);
    return () => clearInterval(timer);
  }, [searchedPhone]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <PackageSearch className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{tr('Track Your Order', 'আপনার অর্ডার ট্র্যাক করুন')}</h1>
          <p className="text-slate-500">{tr('Enter the phone number you used when ordering.', 'অর্ডারের সময় দেওয়া মোবাইল নম্বর লিখুন।')}</p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              id="track-phone-input"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="pill-input w-full pl-12"
              required
            />
          </div>
          <Button id="track-search-btn" type="submit" isLoading={loading} disabled={loading}>
            {tr('Search', 'অনুসন্ধান')}
          </Button>
        </form>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{error}</div>
        )}

        {orders && orders.length === 0 && (
          <GlassCard className="p-8 text-center text-slate-500">
            {tr('No orders found for this phone number.', 'এই নম্বরে কোনো অর্ডার পাওয়া যায়নি।')}
          </GlassCard>
        )}

        {orders && orders.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{tr(`${orders.length} order(s) found`, `${orders.length}টি অর্ডার পাওয়া গেছে`)}</span>
              <button
                type="button"
                onClick={() => fetchOrders(searchedPhone)}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                {tr('Refresh', 'রিফ্রেশ')}{lastUpdated && ` · ${format(lastUpdated, 'h:mm:ss a')}`}
              </button>
            </div>

            {orders.map(order => {
              const cancelled = order.order_status === 'cancelled';
              const currentIndex = STEPS.indexOf(order.order_status as typeof STEPS[number]);
              const label = STATUS_LABELS[order.order_status] || { en: order.order_status, bn: order.order_status };
              return (
                <GlassCard key={order.id} className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                    <div>
                      <div className="font-bold text-slate-800">#{order.order_no}</div>
                      <div className="text-xs text-slate-500">{format(new Date(order.created_at), 'MMM dd, yyyy h:mm a')}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${cancelled ? 'bg-red-100 text-red-600' : 'bg-green-100 text-primary'}`}>
                      {tr(label.en, label.bn)}
                    </span>
                  </div>

                  {cancelled ? (
                    <div className="text-red-500 font-semibold text-center py-3 bg-red-50 rounded-xl border border-red-100 mb-4">
                      {tr('This order has been cancelled.', 'এই অর্ডারটি বাতিল করা হয়েছে।')}
                    </div>
                  ) : (
                    <div className="relative flex justify-between items-center mb-6 mt-2">
                      <div className="absolute left-0 top-3 w-full h-1 bg-slate-200 -z-10 rounded-full" />
                      <div
                        className="absolute left-0 top-3 h-1 bg-primary -z-10 rounded-full transition-all duration-500"
                        style={{ width: `${(Math.max(0, currentIndex) / (STEPS.length - 1)) * 100}%` }}
                      />
                      {STEPS.map((step, idx) => {
                        const done = idx <= currentIndex;
                        const current = idx === currentIndex;
                        return (
                          <div key={step} className="flex flex-col items-center gap-2 bg-surface px-1">
                            <div className={`w-6 h-6 rounded-full border-4 transition-all duration-500 ${
                              current ? 'border-primary bg-white scale-125' : done ? 'border-primary bg-primary' : 'border-slate-200 bg-white'
                            }`} />
                            <span className={`text-[10px] sm:text-xs font-semibold text-center ${
                              current ? 'text-primary' : done ? 'text-slate-800' : 'text-slate-400'
                            }`}>
                              {tr(STATUS_LABELS[step].en, STATUS_LABELS[step].bn)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="text-sm text-slate-600 space-y-1 mb-4">
                    {order.items.map((it, i) => (
                      <div key={i}>{lang === 'en' ? it.name_en : it.name_bn} × {it.quantity}</div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-sm">
                    <div>
                      <span className="text-slate-500">{tr('Total', 'মোট')}: </span>
                      <span className="font-bold text-primary">{formatCurrency(order.grand_total)}</span>
                      <span className={`ml-3 text-xs font-bold uppercase ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                        {order.payment_status === 'paid' ? tr('Paid', 'পরিশোধিত') : tr('Unpaid', 'অপরিশোধিত')}
                      </span>
                    </div>
                    <Link to={`/order/${order.public_token}`} className="text-primary font-semibold hover:underline">
                      {tr('View details', 'বিস্তারিত দেখুন')}
                    </Link>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
