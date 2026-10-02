import React from 'react';
import { Link } from 'react-router-dom';
import { AccountLayout } from '../../../components/AccountLayout/AccountLayout';
import './AccountDashboard.css';

export const AccountDashboard: React.FC = () => {
  return (
    <AccountLayout>
      <div className="account-dashboard">
        
        {/* Profile & Membership Badge */}
        <div className="account-card profile-card">
          <div className="profile-header">
            <div>
              <h2 className="welcome-text">Welcome back, Md. Ashraful Islam</h2>
              <div className="profile-meta">
                <span>Phone: +8801700000000</span>
                <span className="divider">|</span>
                <span>Status: <strong className="text-green">Active</strong></span>
              </div>
            </div>
          </div>
          <div className="membership-badge gold">
            ★ GOLD INVESTOR MEMBER - 8% EXTRA OFF
          </div>
        </div>

        {/* Quick Stats */}
        <div className="account-card stats-card">
          <div className="stat-item">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">16</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">In-transit</div>
            <div className="stat-value text-orange">1</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Lifetime Savings</div>
            <div className="stat-value text-green">৳4,320</div>
          </div>
        </div>

        {/* Recent Active Order */}
        <div className="account-card order-card">
          <h3 className="card-title">RECENT ACTIVE ORDER</h3>
          <div className="order-details">
            <div className="order-header">
              <span className="order-id">Order #ORD-260921-000123</span>
              <span className="order-date">• Placed on 21 Sep 2026</span>
            </div>
            
            <div className="order-status-row">
              <span className="status-label">Status:</span>
              <span className="status-badge transit">OUT FOR DELIVERY</span>
            </div>
            
            <div className="order-items-summary">
              <span className="items-label">Items:</span>
              <span className="items-text">Family Weekly Essentials Combo (x1)</span>
            </div>
            
            <div className="order-total-summary">
              <span className="total-label">Total:</span>
              <span className="total-text">৳2,695.00 <span className="saved-text">(Saved ৳465.00)</span></span>
            </div>
            
            <div className="order-actions">
              <button className="btn-action-primary">Track Live Order</button>
              <button className="btn-action-outline">View Invoice</button>
            </div>
          </div>
        </div>

        {/* Saved Addresses Quick Glance */}
        <div className="account-card address-card">
          <h3 className="card-title">SAVED ADDRESSES QUICK GLANCE</h3>
          <div className="address-details">
            <div className="address-default">
              <strong>Default:</strong> Flat 4B, Road 12, Banani, Dhaka North
            </div>
            
            <div className="address-actions">
              <button className="btn-action-outline">Manage Addresses</button>
              <Link to="/" className="btn-action-primary">Order New Combo Pack</Link>
            </div>
          </div>
        </div>

      </div>
    </AccountLayout>
  );
};