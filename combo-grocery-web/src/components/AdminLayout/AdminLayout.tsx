import React from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { logout as apiLogout } from '../../api/auth.api';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await apiLogout();
    } catch (err) {
      console.warn('Backend logout failed, forcing local logout');
    }
    logout();
    navigate('/login');
  };

  // role_id 1 is admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-wrapper">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="logo-icon">🛒</span>
          <span>ADMIN</span>
        </div>
        
        <nav className="admin-nav">
          <div className="nav-group">
            <Link to="/admin" className="nav-item active">• Dashboard</Link>
          </div>
          
          <div className="nav-group">
            <div className="nav-group-title">[INVENTORY]</div>
            <Link to="/admin" className="nav-item">• Internal Items</Link>
            <Link to="/admin" className="nav-item">• Stock In / Purchases</Link>
            <Link to="/admin" className="nav-item">• Stock Logs (Ledger)</Link>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">[CATALOG]</div>
            <Link to="/admin/combos" className="nav-item">• Combo Packs</Link>
            <Link to="/admin/categories" className="nav-item">• Categories</Link>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">[PROMOTIONS]</div>
            <Link to="/admin" className="nav-item">• Overall Discounts</Link>
            <Link to="/admin/investors/review" className="nav-item">• Investor Reviews</Link>
          </div>

          <div className="nav-group">
            <div className="nav-group-title">[ORDERS & USERS]</div>
            <Link to="/admin" className="nav-item">• All Orders</Link>
            <Link to="/admin" className="nav-item">• Customers</Link>
            <Link to="/admin" className="nav-item">• Audit Logs</Link>
            <Link to="/admin" className="nav-item">• Settings</Link>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-topbar">
          <div className="admin-search">
            <span>🔍</span>
            <input type="text" placeholder="Global Search (Order, Item, User)" />
          </div>
          <div className="admin-topbar-actions">
            <div className="alert-btn">🔔 <span className="badge">3</span></div>
            <div className="staff-profile">
              👤 {user?.first_name || 'Staff'} 
              <button onClick={handleLogout} style={{ marginLeft: '15px', padding: '4px 10px', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Log Out</button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="admin-content-scroll">
          {children}
        </div>
      </div>
    </div>
  );
};