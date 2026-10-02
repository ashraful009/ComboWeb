import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../Header/Header';
import { useAuthStore } from '../../store/auth.store';
import './AccountLayout.css';

interface AccountLayoutProps {
  children: React.ReactNode;
}

import { logout as apiLogout } from '../../api/auth.api';

export const AccountLayout: React.FC<AccountLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

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

  return (
    <>
      <Header />
      
      <div className="container account-breadcrumbs">
        <Link to="/">Home</Link> &gt; <span>My Account</span>
      </div>

      <div className="container account-page-wrapper">
        
        {/* Navigation Sidebar (25%) */}
        <aside className="account-sidebar">
          <h2 className="sidebar-title">MY ACCOUNT</h2>
          <nav className="account-nav">
            <Link to="/account" className={location.pathname === '/account' ? 'active' : ''}>• Dashboard (Overview)</Link>
            <Link to="/account/orders" className={location.pathname === '/account/orders' ? 'active' : ''}>• My Orders</Link>
            <Link to="/account/address" className={location.pathname === '/account/address' ? 'active' : ''}>• Address Book</Link>
            <Link to="/account/investor" className={location.pathname === '/account/investor' ? 'active' : ''}>• Investor Dashboard</Link>
            <Link to="/account/profile" className={location.pathname === '/account/profile' ? 'active' : ''}>• Profile Settings</Link>
            <Link to="/account/security" className={location.pathname === '/account/security' ? 'active' : ''}>• Security</Link>
            <Link to="/account/notifications" className={location.pathname === '/account/notifications' ? 'active' : ''}>• Notifications</Link>
            <a href="#" onClick={handleLogout} className="logout-link">• Log Out</a>
          </nav>
        </aside>

        {/* Main Content Area (75%) */}
        <main className="account-main-content">
          {children}
        </main>

      </div>
    </>
  );
};