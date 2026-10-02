import React, { useEffect, useState } from 'react';
import { AccountLayout } from '../../../components/AccountLayout/AccountLayout';
import { fetchAddresses, addAddress, deleteAddress, setDefaultAddress, updateAddress } from '../../../api/user.api';
import { fetchDeliveryZones } from '../../../api/delivery.api';
import './AddressBook.css';

export const AddressBook: React.FC = () => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: 'Home',
    recipient_name: '',
    recipient_phone: '',
    street_address: '',
    delivery_zone_id: 1,
    is_default: false
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [addressData, zoneData] = await Promise.all([
        fetchAddresses(),
        fetchDeliveryZones()
      ]);
      setAddresses(addressData);
      setZones(zoneData);
    } catch (err: any) {
      console.warn('Failed to fetch data', err);
      setError('Could not load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateAddress(editId, formData);
      } else {
        await addAddress(formData);
      }
      setShowAddForm(false);
      setEditId(null);
      setFormData({
        title: 'Home',
        recipient_name: '',
        recipient_phone: '',
        street_address: '',
        delivery_zone_id: zones.length > 0 ? zones[0].id : 1,
        is_default: false
      });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to set default address');
    }
  };

  const handleEdit = (addr: any) => {
    setEditId(addr.id);
    setFormData({
      title: addr.title,
      recipient_name: addr.recipient_name,
      recipient_phone: addr.recipient_phone,
      street_address: addr.street_address,
      delivery_zone_id: addr.delivery_zone_id || 1,
      is_default: addr.is_default
    });
    setShowAddForm(true);
  };

  if (loading) return <AccountLayout><div style={{padding: '40px'}}>Loading addresses...</div></AccountLayout>;

  return (
    <AccountLayout>
      <div className="account-dashboard">
        <div className="address-book-header">
          <h2 className="page-main-title">Saved Addresses</h2>
          <button className="btn-action-primary" onClick={() => {
            setShowAddForm(!showAddForm);
            if (!showAddForm) {
              setEditId(null);
              setFormData({
                title: 'Home',
                recipient_name: '',
                recipient_phone: '',
                street_address: '',
                delivery_zone_id: zones.length > 0 ? zones[0].id : 1,
                is_default: false
              });
            }
          }}>
            {showAddForm ? 'Cancel' : '+ Add New Address'}
          </button>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

        {showAddForm && (
          <div className="account-card" style={{ marginBottom: '20px' }}>
            <h3>{editId ? 'Edit Address' : 'Add New Address'}</h3>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <input type="text" placeholder="Title (e.g. Home, Office)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={{ padding: '8px' }} />
              <input type="text" placeholder="Recipient Name" value={formData.recipient_name} onChange={e => setFormData({...formData, recipient_name: e.target.value})} required style={{ padding: '8px' }} />
              <input type="text" placeholder="Recipient Phone" value={formData.recipient_phone} onChange={e => setFormData({...formData, recipient_phone: e.target.value})} required style={{ padding: '8px' }} />
              <textarea placeholder="Street Address" value={formData.street_address} onChange={e => setFormData({...formData, street_address: e.target.value})} required style={{ padding: '8px' }} rows={3} />
              <select value={formData.delivery_zone_id} onChange={e => setFormData({...formData, delivery_zone_id: Number(e.target.value)})} style={{ padding: '8px' }} required>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <label>
                  <input type="checkbox" checked={formData.is_default} onChange={e => setFormData({...formData, is_default: e.target.checked})} /> Set as Default
                </label>
              </div>
              <button type="submit" className="btn-action-primary" style={{ width: 'fit-content' }}>Save Address</button>
            </form>
          </div>
        )}

        <div className="address-grid">
          {addresses.length === 0 && <p>No addresses found.</p>}
          {addresses.map((addr) => (
            <div key={addr.id} className={`account-card address-detail-card ${addr.is_default ? 'default-card' : ''}`}>
              <div className="card-top">
                <div className="tag-row">
                  <span className="address-tag">Tag: <strong>{addr.title}</strong></span>
                  {addr.is_default ? <span className="default-badge">[Default]</span> : null}
                </div>
              </div>
              
              <div className="address-content">
                <div className="info-row">
                  <span className="info-label">Recipient:</span>
                  <span className="info-value font-bold">{addr.recipient_name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{addr.recipient_phone}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Address:</span>
                  <span className="info-value">{addr.street_address}</span>
                </div>
                <div className="info-row mt-2">
                  <span className="info-label">Delivery Zone:</span>
                  <span className="info-value zone-text">{addr.zone_name || 'N/A'}</span>
                </div>
              </div>

              <div className="card-actions">
                <button className="btn-action-outline btn-sm" onClick={() => handleEdit(addr)}>Edit</button>
                <button className="btn-action-danger btn-sm" style={{marginLeft: '10px'}} onClick={() => handleDelete(addr.id)}>Delete</button>
                {!addr.is_default && (
                  <button className="btn-action-outline btn-sm" style={{marginLeft: '10px'}} onClick={() => handleSetDefault(addr.id)}>Make Default</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AccountLayout>
  );
};