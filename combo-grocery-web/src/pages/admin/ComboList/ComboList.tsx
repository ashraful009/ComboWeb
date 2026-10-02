import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../../components/AdminLayout/AdminLayout';
import { fetchCombos, deleteCombo } from '../../../api/combo.api';

export const ComboList: React.FC = () => {
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCombos = async () => {
    try {
      const data = await fetchCombos();
      setCombos(data ?? []);
    } catch (err) {
      console.error('Failed to load combos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCombos();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this combo?')) {
      try {
        await deleteCombo(id);
        alert('Combo deleted successfully!');
        loadCombos();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete combo');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="builder-breadcrumbs" style={{ padding: '20px' }}>
        Admin &gt; Catalog &gt; <span>Combos</span>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="admin-card-title" style={{ marginBottom: 0 }}>COMBO PACKS</h2>
            <Link to="/admin/combos/new" className="btn-action-primary">+ Create New Combo</Link>
          </div>
          
          {loading ? (
            <p>Loading combos...</p>
          ) : (
            <table className="order-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Base Price</th>
                  <th>Final Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {combos.length === 0 ? (
                  <tr><td colSpan={7}>No combo packs found.</td></tr>
                ) : (
                  combos.map(combo => (
                    <tr key={combo.id}>
                      <td>{combo.id}</td>
                      <td>{combo.sku}</td>
                      <td><strong>{combo.name}</strong></td>
                      <td>৳{(combo.base_price_paisa / 100).toFixed(2)}</td>
                      <td>৳{(combo.final_price_paisa / 100).toFixed(2)}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          backgroundColor: combo.is_active ? '#e6f4ea' : '#fce8e6',
                          color: combo.is_active ? '#1e8e3e' : '#d93025'
                        }}>
                          {combo.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link to={`/admin/combos/edit/${combo.id}`} style={{ padding: '4px 8px', backgroundColor: '#eef2ff', color: '#4f46e5', borderRadius: '4px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
                            Edit
                          </Link>
                          <button onClick={() => handleDelete(combo.id)} style={{ padding: '4px 8px', backgroundColor: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
