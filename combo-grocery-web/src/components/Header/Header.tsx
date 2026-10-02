import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useCartStore } from '../../store/cart.store';
import './Header.css';

export const Header: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const getTotalItems = useCartStore(state => state.getTotalItems);
  return (
    <header>
      <div className="top-banner">
        OVERALL 10% DISCOUNT ON EVERY COMBO PACK!
      </div>
      <div className="header-main">
        <div className="container header-container">
          <Link to="/" className="logo">
            <div className="logo-icon">🛒</div>
            <span>AggriGo</span>
          </Link>
          
          <div className="search-bar">
            <span>🔍</span>
            <input type="text" placeholder="Search grocery combo packs..." />
          </div>

          <div className="header-actions">
            {user ? (
              <Link to="/account" className="account-btn">
                <span>👤</span>
                <span>{(user.first_name || 'User')} ▾</span>
              </Link>
            ) : (
              <Link to="/login" className="account-btn">
                <span>👤</span>
                <span>Login</span>
              </Link>
            )}

            <Link to="/cart" className="cart-btn">
              <span>🛒</span>
              <span>Cart ({getTotalItems()})</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};