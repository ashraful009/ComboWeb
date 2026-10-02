import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/AdminLayout/AdminLayout';
import { fetchCategories, createCategory } from '../../../api/category.api';

export const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data ?? []);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    setCreating(true);
    setError('');
    try {
      const payload = description.trim() ? { name, slug, description } : { name, slug };
      await createCategory(payload);
      alert('Category created successfully!');
      setName('');
      setSlug('');
      setDescription('');
      loadCategories();
    } catch (err: any) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setError(err.response.data.errors.map((e: any) => e.field + ': ' + e.message).join(', '));
      } else {
        setError(err.response?.data?.message || 'Failed to create category');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="builder-breadcrumbs" style={{ padding: '20px' }}>
        Admin &gt; Catalog &gt; <span>Categories</span>
      </div>

      <div style={{ display: 'flex', gap: '20px', padding: '0 20px' }}>
        <div className="admin-card" style={{ flex: 2 }}>
          <h2 className="admin-card-title">ALL CATEGORIES</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="order-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr><td colSpan={4}>No categories found.</td></tr>
                ) : (
                  categories.map(c => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.slug}</td>
                      <td>{c.description || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-card" style={{ flex: 1, height: 'max-content' }}>
          <h2 className="admin-card-title">CREATE NEW CATEGORY</h2>
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }} 
                required 
                style={{ width: '100%', padding: '8px' }} 
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Slug</label>
              <input 
                type="text" 
                value={slug} 
                onChange={(e) => setSlug(e.target.value)} 
                required 
                style={{ width: '100%', padding: '8px' }} 
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                style={{ width: '100%', padding: '8px' }} 
                rows={3}
              />
            </div>
            <button 
              type="submit" 
              className="btn-action-primary" 
              style={{ width: '100%' }}
              disabled={creating}
            >
              {creating ? 'Creating...' : 'CREATE CATEGORY'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};
