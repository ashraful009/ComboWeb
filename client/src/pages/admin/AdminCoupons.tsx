import React, { useState } from 'react';
import { useFetch, apiClient } from '../../api/client';
import { Coupon } from '@freshagro/shared';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export const AdminCoupons: React.FC = () => {
  const { data: coupons, loading, error, refetch } = useFetch<Coupon[]>('/admin/coupons');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '', type: 'fixed', value: 0, min_order_amount: 0, 
    max_discount_amount: null, usage_limit: null, is_active: true
  });
  const [isSaving, setIsSaving] = useState(false);

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData(coupon);
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '', type: 'fixed', value: 0, min_order_amount: 0, 
        max_discount_amount: null, usage_limit: null, is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | number | boolean | null = value;
    if (type === 'number') {
      finalValue = value === '' ? null : Number(value);
    } else if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    }
    if (name === 'code') finalValue = value.toUpperCase();
    setFormData({ ...formData, [name]: finalValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingCoupon) {
        await apiClient(`/admin/coupons/${editingCoupon.id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData)
        });
      } else {
        await apiClient('/admin/coupons', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      refetch();
      closeModal();
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to save coupon');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (id: number, isActive: boolean) => {
    try {
      await apiClient(`/admin/coupons/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: isActive ? 1 : 0 })
      });
      refetch();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const deleteCoupon = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await apiClient(`/admin/coupons/${id}`, { method: 'DELETE' });
      refetch();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  if (loading) return <div className="p-10">Loading coupons...</div>;
  if (error) return <div className="p-10 text-red-500">Failed to load coupons.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Coupons Management</h1>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Coupon
        </Button>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-sm">
                <th className="py-4 px-6 font-semibold">Code</th>
                <th className="py-4 px-6 font-semibold">Type</th>
                <th className="py-4 px-6 font-semibold">Value</th>
                <th className="py-4 px-6 font-semibold">Min Order</th>
                <th className="py-4 px-6 font-semibold">Usage</th>
                <th className="py-4 px-6 font-semibold text-center">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons?.map(coupon => (
                <tr key={coupon.id} className="text-slate-700 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-bold">{coupon.code}</td>
                  <td className="py-4 px-6 capitalize">{coupon.type}</td>
                  <td className="py-4 px-6 font-semibold text-highlight">
                    {coupon.type === 'percent' ? `${coupon.value}%` : `৳${coupon.value}`}
                  </td>
                  <td className="py-4 px-6">৳{coupon.min_order_amount}</td>
                  <td className="py-4 px-6">
                    {coupon.used_count} {coupon.usage_limit ? `/ ${coupon.usage_limit}` : 'uses'}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={!!coupon.is_active} 
                        onChange={e => toggleStatus(coupon.id, e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button onClick={() => openModal(coupon)} className="p-2 text-slate-400 hover:text-blue-500 bg-white rounded-lg shadow-sm border border-slate-200 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteCoupon(coupon.id)} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-slate-200 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {coupons?.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">No coupons found. Create one above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Coupon Code (Uppercase)</label>
                <input required type="text" name="code" value={formData.code} onChange={handleChange} className="pill-input rounded-xl uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Discount Type</label>
                  <select required name="type" value={formData.type} onChange={handleChange} className="pill-input rounded-xl bg-white">
                    <option value="fixed">Fixed Amount (৳)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Discount Value</label>
                  <input required type="number" name="value" value={formData.value || ''} onChange={handleChange} className="pill-input rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Minimum Order Amount (৳)</label>
                  <input required type="number" name="min_order_amount" value={formData.min_order_amount || ''} onChange={handleChange} className="pill-input rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Max Discount (৳) - Optional</label>
                  <input type="number" name="max_discount_amount" value={formData.max_discount_amount || ''} onChange={handleChange} className="pill-input rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Usage Limit - Optional</label>
                  <input type="number" name="usage_limit" value={formData.usage_limit || ''} onChange={handleChange} className="pill-input rounded-xl" placeholder="Total uses allowed" />
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="is_active" checked={!!formData.is_active} onChange={handleChange} className="w-5 h-5 text-primary rounded focus:ring-primary" />
                    <span className="font-semibold text-slate-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit" isLoading={isSaving}>Save Coupon</Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
