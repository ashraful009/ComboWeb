import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { useFetch } from '../api/client';
import { Order } from '@freshagro/shared';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { CheckCircle2, FileText, ArrowLeft, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

export const OrderConfirmation: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { lang, formatCurrency, pickField } = useLanguage();
  const { settings } = useSettings();

  const { data: responseData, loading, error } = useFetch<{ order: Order, shopInfo: Record<string, string> }>(`/orders/public/${token}`);
  const order = responseData?.order;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-500">Loading your order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <GlassCard className="max-w-md mx-auto p-10 flex flex-col items-center text-red-500">
          <span className="text-6xl mb-4">❌</span>
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="mb-6 text-slate-600 text-sm">We couldn't load the details for this order.</p>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  const statusMap = {
    pending: 'Placed',
    confirmed: 'Confirmed',
    packed: 'Packed',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
  };

  const statusSteps = ['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered'];
  const currentIndex = statusSteps.indexOf(order.order_status);
  const isCancelled = order.order_status === 'cancelled';

  const date = new Date(order.created_at);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Success Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-[bounce_1s_ease-in-out]">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {lang === 'en' ? `Thank you, ${order.customer_name}!` : `ধন্যবাদ, ${order.customer_name}!`}
          </h1>
          <p className="text-slate-500 font-medium">Your order has been successfully placed.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link to={`/invoice/${token}`}>
            <Button variant="outline" className="bg-white">
              <FileText className="w-5 h-5" />
              View Invoice
            </Button>
          </Link>
          {settings?.site_whatsapp && (
            <a href={`https://wa.me/${settings.site_whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 bg-white">
                <MessageCircle className="w-5 h-5" />
                WhatsApp Support
              </Button>
            </a>
          )}
          <Link to="/">
            <Button>
              <ArrowLeft className="w-5 h-5" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Status Tracker */}
        <GlassCard className="p-6">
          <h2 className="font-bold text-lg mb-6">Order Status</h2>
          {isCancelled ? (
            <div className="text-red-500 font-bold text-center py-4 bg-red-50 rounded-xl border border-red-100">
              This order has been cancelled.
            </div>
          ) : (
            <div className="relative flex justify-between items-center mb-2">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-500" 
                style={{ width: `${(Math.max(0, currentIndex) / (statusSteps.length - 1)) * 100}%` }}
              ></div>
              
              {statusSteps.map((step, idx) => {
                const isCompleted = idx <= currentIndex;
                const isCurrent = idx === currentIndex;
                return (
                  <div key={step} className="flex flex-col items-center gap-2 bg-surface">
                    <div className={`w-6 h-6 rounded-full border-4 ${
                      isCurrent ? 'border-primary bg-white scale-125' : 
                      isCompleted ? 'border-primary bg-primary' : 'border-slate-200 bg-white'
                    } transition-all duration-500`} />
                    <span className={`text-xs font-semibold hidden sm:block ${
                      isCurrent ? 'text-primary' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {statusMap[step as keyof typeof statusMap]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <GlassCard className="p-6">
            <h2 className="font-bold text-lg mb-4 border-b border-slate-100 pb-2">Order Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Order No:</span>
                <span className="font-bold">{order.order_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-medium">{format(date, 'MMM dd, yyyy h:mm a')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-medium uppercase">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status:</span>
                <span className={`font-bold uppercase ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                  {order.payment_status}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="font-bold text-lg mb-4 border-b border-slate-100 pb-2">Delivery Address</h2>
            <div className="text-sm text-slate-700 leading-relaxed">
              <p className="font-bold mb-1">{order.customer_name}</p>
              <p>{order.phone}</p>
              {order.email && <p>{order.email}</p>}
              <p className="mt-2">{order.address}</p>
              <p>{order.area}, {order.district}, {order.division}</p>
              {order.delivery_slot && (
                <p className="mt-2 text-primary font-semibold">Time: {order.delivery_slot}</p>
              )}
            </div>
          </GlassCard>

        </div>

        {/* Items Summary */}
        <GlassCard className="p-6">
          <h2 className="font-bold text-lg mb-4 border-b border-slate-100 pb-2">Items Ordered</h2>
          <div className="space-y-3 mb-6">
            {order.items?.map(item => (
              <div key={item.id} className="flex justify-between items-start text-sm">
                <div>
                  <div className="font-semibold">{pickField<string>(item, 'name')}</div>
                  <div className="text-slate-500 text-xs">x {item.quantity}</div>
                </div>
                <div className="font-semibold">{formatCurrency(item.line_total)}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span className="font-semibold">{formatCurrency(order.delivery_charge)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-highlight">
                <span>Discount ({order.coupon_code})</span>
                <span className="font-semibold">-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t border-slate-100 pt-2 mt-2">
              <span className="font-bold text-slate-800">Grand Total</span>
              <span className="font-bold text-lg text-primary">{formatCurrency(order.grand_total)}</span>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};
