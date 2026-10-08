import React, { useState, useEffect } from 'react';
import { useFetch, apiClient } from '../../api/client';
import { Settings } from '@freshagro/shared';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { useSettings } from '../../context/SettingsContext';

export const AdminSettings: React.FC = () => {
  const { data: initialSettings, loading } = useFetch<Settings>('/settings/public');
  const { refreshSettings } = useSettings();
  
  const [formData, setFormData] = useState<Settings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (initialSettings) {
      setFormData(initialSettings);
    }
  }, [initialSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value.split(',').map(s => s.trim()).filter(Boolean)
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    setIsUploading(true);
    try {
      const res = await apiClient<{ url: string }>('/admin/upload', {
        method: 'POST',
        body: uploadData,
      });
      setFormData({ ...formData, hero_image_url: res.url });
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setIsSaving(true);
    setMessage('');
    try {
      await apiClient('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });
      setMessage('Settings updated successfully!');
      refreshSettings();
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !formData) return <div className="p-10">Loading settings...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Shop Settings</h1>
      </div>

      {message && (
        <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 border border-green-100">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Delivery & Payments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Inside Dhaka Charge (৳)</label>
              <input type="number" name="delivery_charge_inside_dhaka" value={formData.delivery_charge_inside_dhaka} onChange={handleChange} className="pill-input rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Outside Dhaka Charge (৳)</label>
              <input type="number" name="delivery_charge_outside_dhaka" value={formData.delivery_charge_outside_dhaka} onChange={handleChange} className="pill-input rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Free Delivery Minimum Amount (৳)</label>
              <input type="number" name="free_delivery_min_amount" value={formData.free_delivery_min_amount} onChange={handleChange} className="pill-input rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Delivery Time Slots (Comma separated)</label>
              <input type="text" name="delivery_time_slots" value={formData.delivery_time_slots.join(', ')} onChange={handleArrayChange} className="pill-input rounded-xl" placeholder="e.g. 10 AM - 12 PM, 2 PM - 4 PM" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">bKash Merchant Number</label>
              <input type="text" name="bkash_number" value={formData.bkash_number} onChange={handleChange} className="pill-input rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Nagad Merchant Number</label>
              <input type="text" name="nagad_number" value={formData.nagad_number} onChange={handleChange} className="pill-input rounded-xl" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Phone Number</label>
              <input type="text" name="site_phone" value={formData.site_phone} onChange={handleChange} className="pill-input rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">WhatsApp Number (with country code)</label>
              <input type="text" name="site_whatsapp" value={formData.site_whatsapp} onChange={handleChange} className="pill-input rounded-xl" placeholder="+8801XXXXXXXXX" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Support Email</label>
              <input type="text" name="site_email" value={formData.site_email} onChange={handleChange} className="pill-input rounded-xl" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Address (EN)</label>
              <input type="text" name="site_address_en" value={formData.site_address_en} onChange={handleChange} className="pill-input rounded-xl" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Address (BN)</label>
              <input type="text" name="site_address_bn" value={formData.site_address_bn} onChange={handleChange} className="pill-input rounded-xl" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Hero Section & Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Hero Image URL</label>
              <div className="flex gap-2">
                <input type="text" name="hero_image_url" value={formData.hero_image_url} onChange={handleChange} className="pill-input rounded-xl flex-1" />
                <label className="flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">
                  {isUploading ? 'Uploading...' : 'Upload'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Hero Title (EN)</label>
              <input type="text" name="hero_title_en" value={formData.hero_title_en} onChange={handleChange} className="pill-input rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Hero Title (BN)</label>
              <input type="text" name="hero_title_bn" value={formData.hero_title_bn} onChange={handleChange} className="pill-input rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Hero Subtitle (EN)</label>
              <textarea name="hero_subtitle_en" value={formData.hero_subtitle_en} onChange={handleChange} className="pill-input rounded-xl min-h-[80px]" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Hero Subtitle (BN)</label>
              <textarea name="hero_subtitle_bn" value={formData.hero_subtitle_bn} onChange={handleChange} className="pill-input rounded-xl min-h-[80px]" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Invoice Policy Note (EN)</label>
              <textarea name="invoice_policy_note_en" value={formData.invoice_policy_note_en} onChange={handleChange} className="pill-input rounded-xl min-h-[80px]" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Invoice Policy Note (BN)</label>
              <textarea name="invoice_policy_note_bn" value={formData.invoice_policy_note_bn} onChange={handleChange} className="pill-input rounded-xl min-h-[80px]" />
            </div>
          </div>
        </GlassCard>

        <div className="flex justify-end pt-4">
          <Button type="submit" className="px-8 py-3 text-lg" isLoading={isSaving}>
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
