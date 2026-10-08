import React, { useState } from 'react';
import { useFetch, apiClient } from '../../api/client';
import { Order, OrderStatusEnum, PaymentStatusEnum } from '@freshagro/shared';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { format } from 'date-fns';
import { Eye, Search, X, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const AdminOrders: React.FC = () => {
  const { data: ordersResponse, loading, error, refetch } = useFetch<{ data: Order[], total: number }>('/admin/orders');
  const orders = ordersResponse?.data;
  const { pickField, formatCurrency } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editStatus, setEditStatus] = useState({ order_status: '', payment_status: '' });

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.order_no.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.phone.includes(searchTerm) ||
                          order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.order_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openModal = async (order: Order) => {
    try {
      const fullOrder = await apiClient<Order>(`/admin/orders/${order.id}`);
      setSelectedOrder(fullOrder);
      setEditStatus({ order_status: order.order_status, payment_status: order.payment_status });
    } catch (err) {
      // fallback to basic order if fetch fails
      setSelectedOrder(order);
      setEditStatus({ order_status: order.order_status, payment_status: order.payment_status });
    }
  };

  const closeModal = () => setSelectedOrder(null);

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setIsSaving(true);
    try {
      if (editStatus.order_status !== selectedOrder.order_status) {
        await apiClient(`/admin/orders/${selectedOrder.id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: editStatus.order_status })
        });
      }
      if (editStatus.payment_status !== selectedOrder.payment_status) {
        await apiClient(`/admin/orders/${selectedOrder.id}/payment-status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: editStatus.payment_status })
        });
      }
      refetch();
      closeModal();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-10">Loading orders...</div>;
  if (error) return <div className="p-10 text-red-500">Failed to load orders.</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Orders</h1>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text" 
              placeholder="Search ID, phone, name..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pill-input rounded-xl pl-10 bg-white"
            />
            <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
          </div>
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="pill-input rounded-xl bg-white md:w-48"
          >
            <option value="all">All Statuses</option>
            {OrderStatusEnum.options.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-sm">
                <th className="py-4 px-6 font-semibold">Order No</th>
                <th className="py-4 px-6 font-semibold">Date</th>
                <th className="py-4 px-6 font-semibold">Customer</th>
                <th className="py-4 px-6 font-semibold">Total</th>
                <th className="py-4 px-6 font-semibold">Payment</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders?.map(order => (
                <tr key={order.id} className="text-slate-700 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-bold">#{order.order_no}</td>
                  <td className="py-4 px-6 text-sm">{format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')}</td>
                  <td className="py-4 px-6">
                    <div className="font-semibold">{order.customer_name}</div>
                    <div className="text-xs text-slate-500">{order.phone}</div>
                  </td>
                  <td className="py-4 px-6 font-bold">{formatCurrency(order.grand_total)}</td>
                  <td className="py-4 px-6">
                    <div className="text-xs font-semibold uppercase">{order.payment_method}</div>
                    <div className={`text-xs font-bold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                      {order.payment_status.toUpperCase()}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                      order.order_status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.order_status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => openModal(order)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders?.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="max-w-3xl w-full p-0 max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h2 className="text-2xl font-bold">Order #{selectedOrder.order_no}</h2>
              <div className="flex items-center gap-3">
                <Link to={`/invoice/${selectedOrder.public_token}`} target="_blank" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary bg-slate-100 px-3 py-1.5 rounded-lg">
                  <Printer className="w-4 h-4" />
                  View/Print Invoice
                </Link>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-700 p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-50 flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              
              {/* Customer Info */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Customer & Delivery</h3>
                <div className="space-y-1 text-slate-600">
                  <p><strong className="text-slate-800">Name:</strong> {selectedOrder.customer_name}</p>
                  <p><strong className="text-slate-800">Phone:</strong> {selectedOrder.phone}</p>
                  {selectedOrder.email && <p><strong className="text-slate-800">Email:</strong> {selectedOrder.email}</p>}
                  <p className="pt-2"><strong className="text-slate-800">Address:</strong> {selectedOrder.address}</p>
                  <p>{selectedOrder.area}, {selectedOrder.district}, {selectedOrder.division}</p>
                  <p><strong className="text-slate-800">Zone:</strong> {selectedOrder.delivery_zone}</p>
                  {selectedOrder.delivery_slot && <p><strong className="text-slate-800">Time Slot:</strong> {selectedOrder.delivery_slot}</p>}
                  {selectedOrder.delivery_note && <p><strong className="text-slate-800">Note:</strong> {selectedOrder.delivery_note}</p>}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Payment Details</h3>
                <div className="space-y-1 text-slate-600">
                  <p><strong className="text-slate-800">Method:</strong> <span className="uppercase">{selectedOrder.payment_method}</span></p>
                  {selectedOrder.payment_method !== 'cod' && (
                    <>
                      <p><strong className="text-slate-800">Sender:</strong> {selectedOrder.payment_sender_number}</p>
                      <p><strong className="text-slate-800">Txn ID:</strong> {selectedOrder.payment_txn_id}</p>
                    </>
                  )}
                  <p className="pt-2"><strong className="text-slate-800">Subtotal:</strong> {formatCurrency(selectedOrder.subtotal)}</p>
                  <p><strong className="text-slate-800">Delivery:</strong> {formatCurrency(selectedOrder.delivery_charge)}</p>
                  {selectedOrder.discount_amount > 0 && <p><strong className="text-slate-800">Discount:</strong> -{formatCurrency(selectedOrder.discount_amount)} ({selectedOrder.coupon_code})</p>}
                  <p className="pt-2 font-bold text-lg text-primary"><strong className="text-slate-800">Total:</strong> {formatCurrency(selectedOrder.grand_total)}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 md:col-span-2">
                <h3 className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Order Items</h3>
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.items?.map(item => (
                      <tr key={item.id}>
                        <td className="py-2">
                          <div className="font-bold">{pickField<string>(item, 'name')}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">{item.items_snapshot?.map((i: Record<string, unknown>) => `${pickField<string>(i, 'name')} ${i.qtyLabel || i.qty_label}`).join(', ')}</div>
                        </td>
                        <td className="py-2 text-center">x{item.quantity}</td>
                        <td className="py-2 text-right font-bold">{formatCurrency(item.line_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Status Update Form */}
            <div className="p-6 bg-white border-t border-slate-100 flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Order Status</label>
                <select 
                  value={editStatus.order_status} 
                  onChange={e => setEditStatus({...editStatus, order_status: e.target.value})}
                  className="pill-input rounded-lg bg-white"
                >
                  {OrderStatusEnum.options.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Payment Status</label>
                <select 
                  value={editStatus.payment_status} 
                  onChange={e => setEditStatus({...editStatus, payment_status: e.target.value})}
                  className="pill-input rounded-lg bg-white"
                >
                  {PaymentStatusEnum.options.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Button onClick={handleUpdateStatus} isLoading={isSaving} className="w-full md:w-auto h-[42px] px-8">
                Save Changes
              </Button>
            </div>

          </GlassCard>
        </div>
      )}
    </div>
  );
};
