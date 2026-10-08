import React from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { useFetch } from '../api/client';
import { Order } from '@freshagro/shared';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download } from 'lucide-react';
import { Button } from '../components/Button';

export const Invoice: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { lang, formatCurrency, pickField, formatNumber } = useLanguage();
  const { settings } = useSettings();

  const { data: responseData, loading, error } = useFetch<{ order: Order, shopInfo: Record<string, string> }>(`/orders/public/${token}`);
  const order = responseData?.order;

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-20 text-center">Loading invoice...</div>;
  if (error || !order) return <div className="p-20 text-center text-red-500">Invoice not found.</div>;

  const invoiceNo = `INV-${order.order_no}`;
  const date = new Date(order.created_at);
  const isPaid = order.payment_status === 'paid';
  const due = isPaid ? 0 : order.grand_total;
  const paid = isPaid ? order.grand_total : 0;

  return (
    <div className="bg-slate-50 min-h-screen py-10 print:py-0 print:bg-white font-en">
      {/* Print Controls (Hidden on print) */}
      <div className="container mx-auto max-w-4xl px-4 mb-6 print:hidden">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-center gap-4">
          <Button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-700">
            <Printer className="w-4 h-4" />
            {lang === 'en' ? 'Print' : 'প্রিন্ট করুন (Print)'}
          </Button>
          <Button onClick={handlePrint} variant="outline" className="bg-white">
            <Download className="w-4 h-4" />
            {lang === 'en' ? 'Download PDF' : 'ডাউনলোড PDF (Download PDF)'}
          </Button>
          {order.payment_method === 'cod' && (
            <div className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-200 ml-auto flex items-center">
              {lang === 'en' ? 'Cash on Delivery' : 'ক্যাশ অন ডেলিভারি (Cash on Delivery)'}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Sheet */}
      <div className="container mx-auto max-w-4xl px-4 print:px-0">
        <div className="bg-white rounded-3xl shadow-xl print:shadow-none p-10 md:p-14 border border-slate-100 print:border-none print:p-0">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-200 pb-8 mb-8 gap-6">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-3xl mb-1">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                <span>freshagro.farm</span>
              </div>
            </div>
            <div className="text-left md:text-right">
              <h1 className="text-4xl font-bold text-slate-800 mb-2">ইনভয়েস / INVOICE</h1>
              <div className="text-slate-600 font-medium">Invoice No: <span className="font-bold text-slate-800">{invoiceNo}</span></div>
              <div className="text-slate-600 font-medium">Order ID: <span className="font-bold text-slate-800">#{order.order_no}</span></div>
              <div className="text-slate-600 font-medium">Date: <span className="font-bold text-slate-800">{format(date, 'dd MMM, yyyy')}</span></div>
              
              <div className={`inline-block mt-4 px-4 py-1.5 rounded-full text-sm font-bold border ${
                order.payment_method === 'cod' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                isPaid ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
              }`}>
                {order.payment_method === 'cod' ? 'ক্যাশ অন ডেলিভারি' : (isPaid ? 'পরিশোধিত (Paid)' : 'বকেয়া (Due)')}
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h2 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">ক্রেতার তথ্য / Billed To</h2>
              <div className="text-slate-700 font-medium">
                <p className="font-bold text-lg">{order.customer_name}</p>
                <p>Phone: {order.phone}</p>
                {order.email && <p>Email: {order.email}</p>}
                <p className="mt-2">{order.address}</p>
                <p>{order.area}, {order.district}</p>
                <p>{order.division}, Bangladesh</p>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h2 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">বিক্রেতার তথ্য / Seller</h2>
              <div className="text-slate-700 font-medium">
                <p className="font-bold text-lg">freshagro.farm</p>
                {settings && (
                  <>
                    <p>{settings.site_address_en}</p>
                    <p>Phone: {settings.site_phone}</p>
                    <p>Email: {settings.site_email}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-200">
                  <th className="py-3 px-4 font-bold text-slate-800 rounded-tl-xl w-12">SL</th>
                  <th className="py-3 px-4 font-bold text-slate-800">বিবরণ (Items)</th>
                  <th className="py-3 px-4 font-bold text-slate-800 text-center w-32">পরিমাণ (Qty)</th>
                  <th className="py-3 px-4 font-bold text-slate-800 text-right w-32">মূল্য (Price)</th>
                  <th className="py-3 px-4 font-bold text-slate-800 text-right rounded-tr-xl w-32">মোট (Total)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items?.map((item, index) => (
                  <tr key={item.id} className="text-slate-700">
                    <td className="py-4 px-4 font-semibold text-slate-500">{formatNumber(index + 1)}.</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-lg text-slate-800">{pickField<string>(item, 'name')}</div>
                      <div className="text-xs text-slate-500 mt-1 line-clamp-2 pr-4 leading-relaxed">
                        {item.items_snapshot?.map((i: Record<string, unknown>) => `${pickField<string>(i, 'name')} ${i.qtyLabel || i.qty_label}`).join(', ')}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-semibold">{formatNumber(item.quantity)}</td>
                    <td className="py-4 px-4 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="py-4 px-4 text-right font-bold text-slate-800">{formatCurrency(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Footer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
            <div>
              <div className="text-sm text-slate-500 mb-6 font-medium">
                <p>{settings ? pickField<string>(settings, 'invoice_policy_note') : 'পরিবর্তন বা ফেরতের নিয়মাবলী, পরিবর্তন বা ফেরতের নিয়মাবলী আবদান তার কররা করেন পরিবর্তন বা ফেরতের নিয়মাবলী কথা আথাত হয়।'}</p>
                <p className="mt-4 font-bold text-lg text-slate-800">ধন্যবাদ! (Thank You!)</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
                <QRCodeSVG value={window.location.href} size={80} className="border-4 border-white shadow-sm rounded-lg" />
                <p>This is a computer-generated invoice.<br/>Scan QR code to verify online.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="space-y-3 text-slate-600 font-medium border-b border-slate-200 pb-4 mb-4">
                <div className="flex justify-between">
                  <span>সাবটোটাল / Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ / Delivery</span>
                  <span>{formatCurrency(order.delivery_charge)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-slate-800">
                    <span>ডিসকাউন্ট / Discount ({order.coupon_code})</span>
                    <span>-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-800 text-lg">সর্বমোট / Grand Total</span>
                <span className="font-bold text-slate-800 text-xl">{formatCurrency(order.grand_total)}</span>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <span className="font-bold text-slate-800 text-lg">পরিশোধিত / Paid</span>
                <span className="font-bold text-slate-800 text-xl">{formatCurrency(paid)}</span>
              </div>
              
              {due > 0 && (
                <div className="text-right text-sm font-medium text-slate-500 mt-1">
                  (বকেয়া / Due {formatCurrency(due)} on delivery)
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
