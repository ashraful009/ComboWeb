import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../../components/AdminLayout/AdminLayout';
import { createCombo, updateCombo, fetchComboById } from '../../../api/combo.api';
import { fetchCategories } from '../../../api/category.api';
import { fetchItems } from '../../../api/item.api';
import { uploadImage } from '../../../api/upload.api';
import './ComboBuilder.css';

export const ComboBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [categories, setCategories] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [comboName, setComboName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Image Upload State
  const [uploading, setUploading] = useState(false);
  const [primaryImage, setPrimaryImage] = useState<string>('');

  // State for ingredients
  const [items, setItems] = useState<any[]>([
    { id: Date.now(), item_id: '', name: '', costPerUnit: 0, qty: 1, unit: 'kg' }
  ]);

  const [basePrice, setBasePrice] = useState(0);

  useEffect(() => {
    fetchCategories().then(data => {
      setCategories(data);
      if (data.length > 0 && !isEditing) {
        setCategoryId(data[0].id);
      }
    }).catch(console.error);

    fetchItems().then(setInventoryItems).catch(console.error);

    if (isEditing) {
      setLoading(true);
      fetchComboById(id).then(data => {
        setComboName(data.name);
        setSlug(data.slug);
        setCategoryId(data.category_id || "");
        setDescription(data.description || '');
        setStatus(data.is_active ? 'active' : 'inactive');
        setBasePrice(data.base_price_paisa / 100);
        if (data.items && data.items.length > 0) {
          setItems(data.items.map((i: any, idx: number) => ({
            id: Date.now() + idx,
            item_id: i.item_id || '',
            name: i.name,
            costPerUnit: (i.avg_cost_paisa || 0) / 100,
            qty: i.quantity,
            unit: i.unit_type || 'unit'
          })));
        }
        if (data.images && data.images.length > 0) {
          setPrimaryImage(data.images[0].image_url);
        }
      }).catch(err => {
        console.error('Failed to fetch combo for edit', err);
        setError('Failed to load combo details');
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [id, isEditing]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError('');
      const url = await uploadImage(file);
      setPrimaryImage(url);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError('Failed to upload image. ' + (err.response?.data?.message || ''));
    } finally {
      setUploading(false);
    }
  };

  // Calculations
  const calculatedCost = items.reduce((acc, item) => acc + (item.costPerUnit * item.qty), 0);
  const grossMarginValue = basePrice - calculatedCost;
  const grossMarginPercent = basePrice > 0 ? ((grossMarginValue / basePrice) * 100).toFixed(1) : 0;

  // Promo & Investor Simulations
  const overallPromo = 10; // 10%
  const silverExtra = 5; // 5%
  const goldExtra = 8; // 8%

  const guestFinalPrice = basePrice - (basePrice * (overallPromo / 100));
  const guestMargin = ((guestFinalPrice - calculatedCost) / guestFinalPrice) * 100;

  const silverFinalPrice = basePrice - (basePrice * ((overallPromo + silverExtra) / 100));
  const silverMargin = ((silverFinalPrice - calculatedCost) / silverFinalPrice) * 100;

  const goldFinalPrice = basePrice - (basePrice * ((overallPromo + goldExtra) / 100));
  const isGoldBlocked = goldFinalPrice < calculatedCost; // Min margin guard

  const handleItemNameChange = (id: number, val: string) => {
    const matched = inventoryItems.find(inv => inv.name.toLowerCase() === val.trim().toLowerCase());
    setItems(items.map(i => {
      if (i.id !== id) return i;
      if (matched) {
        return {
          ...i,
          name: val,
          item_id: matched.id,
          costPerUnit: matched.avg_cost_paisa ? matched.avg_cost_paisa / 100 : i.costPerUnit,
          unit: matched.unit_type || i.unit || 'kg'
        };
      }
      return {
        ...i,
        name: val,
        item_id: ''
      };
    }));
  };

  const handleCostChange = (id: number, cost: number) => {
    setItems(items.map(i => i.id === id ? { ...i, costPerUnit: cost } : i));
  };

  const handleUnitChange = (id: number, unit: string) => {
    setItems(items.map(i => i.id === id ? { ...i, unit } : i));
  };

  const handleQtyChange = (id: number, val: number) => {
    setItems(items.map(i => i.id === id ? { ...i, qty: val } : i));
  };

  const handleRemove = (id: number) => {
    if (items.length <= 1) {
      setItems([{ id: Date.now(), item_id: '', name: '', costPerUnit: 0, qty: 1, unit: 'kg' }]);
      return;
    }
    setItems(items.filter(i => i.id !== id));
  };

  const handleAddRow = () => {
    setItems([...items, { id: Date.now(), item_id: '', name: '', costPerUnit: 0, qty: 1, unit: 'kg' }]);
  };

  const handleSave = async () => {
    const validItems = items.filter(i => i.name && i.name.trim().length > 0);
    if (!comboName || !slug || validItems.length === 0 || basePrice <= 0 || !categoryId) {
      setError('Please fill in required fields (Name, Slug, Category, at least one Item Name, Base Price)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload: any = {
        name: comboName,
        slug: slug,
        category_id: Number(categoryId),
        base_price_paisa: Math.round(basePrice * 100),
        final_price_paisa: Math.round(guestFinalPrice * 100),
        investor_price_paisa: Math.round(silverFinalPrice * 100),
        is_active: status === 'active',
        items: validItems.map(i => ({
          item_id: i.item_id ? Number(i.item_id) : undefined,
          name: i.name.trim(),
          quantity: Math.max(1, Math.round(Number(i.qty) || 1)),
          costPerUnit: Number(i.costPerUnit) || 0,
          unit: i.unit || 'kg'
        }))
      };
      if (description) {
        payload.description = description;
      }
      if (primaryImage) {
        payload.images = [
          {
            image_url: primaryImage,
            is_primary: true,
            display_order: 1
          }
        ];
      } else {
        payload.images = [];
      }
      
      if (isEditing) {
        await updateCombo(Number(id), payload);
        alert('Combo Updated Successfully!');
      } else {
        await createCombo(payload);
        alert('Combo Saved Successfully!');
      }
      navigate('/admin/combos');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save combo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="builder-breadcrumbs">
        Admin &gt; Catalog &gt; Combos &gt; <span>{isEditing ? 'Edit Combo' : 'Create New Combo'}</span>
      </div>

      <div className="builder-layout">
        
        {/* Left: Combo Composition Builder (60%) */}
        <div className="builder-left">
          <div className="admin-card">
            <h2 className="admin-card-title">COMBO COMPOSITION BUILDER</h2>
            
            {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
            <div className="form-group-row">
              <label>Combo Name:</label>
              <input type="text" value={comboName} onChange={(e) => {
                setComboName(e.target.value);
                if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
              }} />
            </div>
            
            <div className="form-group-row">
              <label>Slug (SKU):</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            
            <div className="form-group-row">
              <label>Category:</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}>
                <option value="">Select a Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group-row">
              <label>Status:</label>
              <div className="radio-group-inline">
                <label><input type="radio" name="status" checked={status === 'active'} onChange={() => setStatus('active')} /> Active</label>
                <label><input type="radio" name="status" checked={status === 'draft'} onChange={() => setStatus('draft')} /> Draft</label>
                <label><input type="radio" name="status" checked={status === 'inactive'} onChange={() => setStatus('inactive')} /> Inactive</label>
              </div>
            </div>

            <div className="ingredients-box">
              <h3 className="sub-title">COMBO INGREDIENT ITEMS</h3>
              <table className="builder-table">
                <thead>
                  <tr>
                    <th style={{ width: '38%' }}>Item Name</th>
                    <th style={{ width: '28%' }}>Unit Cost</th>
                    <th style={{ width: '18%' }}>Qty in Pack</th>
                    <th style={{ width: '12%' }}>Total Cost</th>
                    <th style={{ width: '4%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <input 
                          type="text" 
                          list="inventory-suggestions"
                          value={item.name} 
                          placeholder="Type item name (e.g. Miniket Rice 5kg)"
                          onChange={(e) => handleItemNameChange(item.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: '#666', fontSize: '13px' }}>৳</span>
                          <input 
                            type="number"
                            min="0"
                            step="any"
                            value={item.costPerUnit || ''}
                            placeholder="0.00"
                            onChange={(e) => handleCostChange(item.id, parseFloat(e.target.value) || 0)}
                            style={{
                              width: '70px',
                              padding: '6px 8px',
                              borderRadius: '4px',
                              border: '1px solid #ccc',
                              textAlign: 'right',
                              fontSize: '13px'
                            }}
                          />
                          <span style={{ color: '#888', fontSize: '13px' }}>/</span>
                          <select 
                            value={item.unit}
                            onChange={(e) => handleUnitChange(item.id, e.target.value)}
                            style={{
                              padding: '6px 6px',
                              borderRadius: '4px',
                              border: '1px solid #ccc',
                              fontSize: '13px'
                            }}
                          >
                            <option value="kg">kg</option>
                            <option value="liter">liter</option>
                            <option value="pcs">pcs</option>
                            <option value="pack">pack</option>
                            <option value="gm">gm</option>
                            <option value="box">box</option>
                            <option value="unit">unit</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div className="qty-input-group">
                          <input 
                            type="number" 
                            min="1"
                            step="1" 
                            value={item.qty} 
                            onChange={(e) => handleQtyChange(item.id, parseFloat(e.target.value) || 0)} 
                          />
                          <span style={{ fontSize: '13px', color: '#555', minWidth: '25px' }}>{item.unit}</span>
                        </div>
                      </td>
                      <td className="font-bold">৳{(item.costPerUnit * item.qty).toFixed(2)}</td>
                      <td>
                        <button 
                          type="button"
                          className="btn-icon text-red" 
                          onClick={() => handleRemove(item.id)}
                          title="Remove item"
                          style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}
                        >
                          ✖
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <datalist id="inventory-suggestions">
                {inventoryItems.map(inv => (
                  <option key={inv.id} value={inv.name} />
                ))}
              </datalist>

              <button 
                type="button"
                className="btn-text-add" 
                onClick={handleAddRow}
                style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 0' }}
              >
                + Add Item Row
              </button>
            </div>

            <div className="stock-alert">
              Live Stock Capacity: <strong>18 Combos</strong> (Limited by Soybean Oil)
            </div>

            <div className="form-group-col mt-4">
              <label>Short Description:</label>
              <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="form-group-col mt-4">
              <label>Combo Images (Upload Primary Image):</label>
              <div className="upload-buttons" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label className="btn-upload" style={{ cursor: 'pointer', display: 'inline-block' }}>
                  {uploading ? 'Uploading...' : '+ Upload Primary'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    style={{ display: 'none' }} 
                    disabled={uploading}
                  />
                </label>
                {primaryImage && (
                  <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden' }}>
                    <img src={primaryImage} alt="Primary" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button 
                      onClick={() => setPrimaryImage('')}
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: 'rgba(255, 0, 0, 0.8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0 0 0 4px',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      title="Remove image"
                    >
                      ✖
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="builder-actions">
              <button className="btn-save" onClick={handleSave} disabled={loading}>
                {loading ? 'SAVING...' : (isEditing ? 'UPDATE COMBO' : 'SAVE COMBO')}
              </button>
              <button 
                type="button" 
                className="btn-preview"
                onClick={() => {
                  if (id) {
                    window.open(`/combos/${id}`, '_blank');
                  } else {
                    alert('Please save the combo first before previewing on storefront.');
                  }
                }}
              >
                PREVIEW AS STOREFRONT USER
              </button>
            </div>

          </div>
        </div>

        {/* Right: Pricing & Margin Panel (40%) */}
        <div className="builder-right">
          
          <div className="admin-card mb-4">
            <h2 className="admin-card-title">LIVE COST ENGINE</h2>
            
            <div className="pricing-row highlight-gray">
              <span>Calculated Cost:</span>
              <span className="font-bold">৳{calculatedCost.toFixed(2)}</span>
            </div>
            <div className="text-hint">(Sum of all ingredients)</div>

            <div className="pricing-row mt-4">
              <span className="font-bold">Set Base Price:</span>
              <input 
                type="number" 
                className="price-input" 
                value={basePrice} 
                onChange={(e) => setBasePrice(parseInt(e.target.value) || 0)} 
              />
            </div>

            <div className="pricing-row mt-4 highlight-green-light">
              <span className="font-bold">Gross Margin:</span>
              <span className="font-bold">{grossMarginPercent}%</span>
            </div>
          </div>

          <div className="admin-card">
            <h2 className="admin-card-title">PRICING PREVIEW ENGINE</h2>
            
            <div className="preview-block">
              <div className="preview-header">Guest / Normal:</div>
              <div className="preview-calc">Base: ৳{basePrice} - Promo ({overallPromo}%):</div>
              <div className="preview-final">
                Final: ৳{guestFinalPrice.toFixed(2)} 
                <span className="margin-tag"> (Margin: {guestMargin.toFixed(1)}%)</span>
              </div>
            </div>

            <div className="preview-block">
              <div className="preview-header">Silver Investor ({silverExtra}% Extra):</div>
              <div className="preview-final">
                Final: ৳{silverFinalPrice.toFixed(2)} 
                <span className="margin-tag warning"> ({silverMargin <= 0 ? 'Loss' : 'Break-even'})</span>
              </div>
            </div>

            <div className="preview-block">
              <div className="preview-header">Gold Investor ({goldExtra}% Extra):</div>
              <div className="preview-final">
                {isGoldBlocked ? (
                  <span className="margin-tag error">⚠️ Blocked by Min-Margin Guard</span>
                ) : (
                  <>Final: ৳{goldFinalPrice.toFixed(2)}</>
                )}
              </div>
            </div>

            <div className="stacking-note">
              ℹ️ Stacking Mode: Additive
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};