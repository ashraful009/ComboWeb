import React, { useState } from 'react';
import { useFetch, apiClient } from '../../api/client';
import { Combo, ComboItem } from '@freshagro/shared';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { Plus, Edit2, Trash2, X, GripVertical } from 'lucide-react';

export const AdminCombos: React.FC = () => {
  const { data: combos, loading, error, refetch } = useFetch<Combo[]>('/admin/combos');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [formData, setFormData] = useState<Partial<Combo>>({
    name_bn: '', name_en: '', tag_bn: '', tag_en: '', serves: '', 
    weight_label: '', image_url: '', market_price: 0, price: 0, 
    is_active: true, sort_order: 0, items: []
  });
  
  const [comboItems, setComboItems] = useState<Partial<ComboItem>[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const openModal = (combo?: Combo) => {
    if (combo) {
      setEditingCombo(combo);
      setFormData(combo);
      setComboItems(combo.items || []);
    } else {
      setEditingCombo(null);
      setFormData({
        name_bn: '', name_en: '', tag_bn: '', tag_en: '', serves: '', 
        weight_label: '', image_url: '', market_price: 0, price: 0, 
        is_active: true, sort_order: 0
      });
      setComboItems([]);
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
    setFormData({ ...formData, [name]: finalValue });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    try {
      const res = await apiClient<{ url: string }>('/admin/upload', {
        method: 'POST',
        body: formData,
      });
      setFormData(prev => ({ ...prev, image_url: res.url }));
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newItems = [...comboItems];
    let finalValue: string | number = value;
    if (type === 'number') {
      finalValue = value === '' ? 0 : Number(value);
    }
    newItems[index] = { ...newItems[index], [name]: finalValue };
    setComboItems(newItems);
  };

  const addItemRow = () => {
    setComboItems([...comboItems, { name_bn: '', name_en: '', qty_label: '', market_price: 0, price: 0, sort_order: comboItems.length }]);
  };

  const removeItemRow = (index: number) => {
    setComboItems(comboItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = { ...formData, items: comboItems };
    try {
      if (editingCombo) {
        await apiClient(`/admin/combos/${editingCombo.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiClient('/admin/combos', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      refetch();
      closeModal();
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to save combo');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (id: number, isActive: boolean) => {
    try {
      await apiClient(`/admin/combos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: isActive ? 1 : 0 })
      });
      refetch();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const deleteCombo = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this combo? This action cannot be undone.')) return;
    try {
      await apiClient(`/admin/combos/${id}`, { method: 'DELETE' });
      refetch();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  if (loading) return <div className="p-10">Loading combos...</div>;
  if (error) return <div className="p-10 text-red-500">Failed to load combos.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Combos Management</h1>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Combo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {combos?.map(combo => (
          <GlassCard key={combo.id} className="p-4 flex flex-col h-full">
            <div className="flex gap-4 mb-4">
              <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                {combo.image_url ? (
                  <img src={combo.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 text-lg">{combo.name_en}</h3>
                  <label className="relative inline-flex items-center cursor-pointer ml-2 shrink-0">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={!!combo.is_active} 
                      onChange={e => toggleStatus(combo.id, e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="text-sm text-slate-500 mb-1">{combo.name_bn}</div>
                <div className="flex items-end gap-2 mt-2">
                  <div className="text-xl font-bold text-primary">৳{combo.price}</div>
                  <div className="text-sm line-through text-slate-400 mb-0.5">৳{combo.market_price}</div>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg mb-4 flex-1">
              <strong>{combo.items?.length || 0} Items:</strong> {combo.items?.map(i => i.name_en).join(', ')}
            </div>

            <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => openModal(combo)} className="px-3 py-1 text-sm h-8 bg-white text-slate-600">
                <Edit2 className="w-4 h-4 mr-1 inline" /> Edit
              </Button>
              <Button variant="outline" onClick={() => deleteCombo(combo.id)} className="px-3 py-1 text-sm h-8 bg-white border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300">
                <Trash2 className="w-4 h-4 mr-1 inline" /> Delete
              </Button>
            </div>
          </GlassCard>
        ))}
        {combos?.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 border-dashed">
            No combos found. Create one to get started!
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="max-w-4xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-2xl font-bold">{editingCombo ? 'Edit Combo' : 'Create Combo'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto pr-2 space-y-8 flex-1">
                
                {/* Combo Details */}
                <div>
                  <h3 className="font-bold text-lg mb-4 border-b border-slate-100 pb-2">Combo Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Name (EN) *</label>
                      <input required type="text" name="name_en" value={formData.name_en} onChange={handleChange} className="pill-input rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Name (BN) *</label>
                      <input required type="text" name="name_bn" value={formData.name_bn} onChange={handleChange} className="pill-input rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Tag (EN)</label>
                      <input type="text" name="tag_en" value={formData.tag_en || ''} onChange={handleChange} className="pill-input rounded-xl" placeholder="e.g. Best Seller" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Tag (BN)</label>
                      <input type="text" name="tag_bn" value={formData.tag_bn || ''} onChange={handleChange} className="pill-input rounded-xl" placeholder="e.g. বেস্ট সেলার" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Price (৳) *</label>
                      <input required type="number" name="price" value={formData.price} onChange={handleChange} className="pill-input rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Market Price (৳) *</label>
                      <input required type="number" name="market_price" value={formData.market_price} onChange={handleChange} className="pill-input rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Serves</label>
                      <input type="text" name="serves" value={formData.serves || ''} onChange={handleChange} className="pill-input rounded-xl" placeholder="e.g. 4-5 Persons" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Weight Label</label>
                      <input type="text" name="weight_label" value={formData.weight_label || ''} onChange={handleChange} className="pill-input rounded-xl" placeholder="e.g. 10 kg" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-1">Image URL</label>
                      <div className="flex gap-2">
                        <input type="text" name="image_url" value={formData.image_url || ''} onChange={handleChange} className="pill-input rounded-xl flex-1" />
                        <label className="flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">
                          {isUploading ? 'Uploading...' : 'Upload'}
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                        </label>
                      </div>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-2 gap-4 items-center">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="is_active" checked={!!formData.is_active} onChange={handleChange} className="w-5 h-5 text-primary rounded focus:ring-primary" />
                        <span className="font-semibold text-slate-700">Active</span>
                      </label>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Sort Order</label>
                        <input type="number" name="sort_order" value={formData.sort_order} onChange={handleChange} className="pill-input rounded-xl bg-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Combo Items */}
                <div>
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                    <h3 className="font-bold text-lg">Combo Items</h3>
                    <Button type="button" onClick={addItemRow} variant="outline" className="h-8 px-3 py-0 text-sm bg-white">
                      <Plus className="w-4 h-4 mr-1 inline" /> Add Item
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {comboItems.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="pt-2 text-slate-400 cursor-move"><GripVertical className="w-5 h-5" /></div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 flex-1">
                          <input required type="text" name="name_en" value={item.name_en} onChange={e => handleItemChange(index, e)} placeholder="Name EN" className="pill-input rounded-lg col-span-2 md:col-span-1" />
                          <input required type="text" name="name_bn" value={item.name_bn} onChange={e => handleItemChange(index, e)} placeholder="Name BN" className="pill-input rounded-lg col-span-2 md:col-span-1" />
                          <input required type="text" name="qty_label" value={item.qty_label} onChange={e => handleItemChange(index, e)} placeholder="Qty (e.g. 1 kg)" className="pill-input rounded-lg col-span-2 md:col-span-1" />
                          <input required type="number" name="market_price" value={item.market_price} onChange={e => handleItemChange(index, e)} placeholder="Mkt Price ৳" className="pill-input rounded-lg" />
                          <input required type="number" name="price" value={item.price} onChange={e => handleItemChange(index, e)} placeholder="Our Price ৳" className="pill-input rounded-lg" />
                        </div>
                        <button type="button" onClick={() => removeItemRow(index)} className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-slate-200 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {comboItems.length === 0 && (
                      <p className="text-sm text-slate-500 italic text-center py-4 border-2 border-dashed border-slate-200 rounded-xl">No items added yet. Click 'Add Item' above.</p>
                    )}
                  </div>
                </div>

              </div>
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100 shrink-0">
                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit" isLoading={isSaving} className="px-8">Save Combo</Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
