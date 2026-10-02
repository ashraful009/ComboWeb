import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
import { useCartStore } from '../../store/cart.store';
import { useAuthStore } from '../../store/auth.store';
import { syncCart } from '../../api/cart.api';
import './Cart.css';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items: cartItems, updateQuantity, removeItem, clearCart, getSubtotal } = useCartStore();
  const { token } = useAuthStore();
  const [syncing, setSyncing] = useState(false);

  const handleQtyChange = (id: number, delta: number) => {
    updateQuantity(id, delta);
  };

  const handleRemove = (id: number) => {
    removeItem(id);
  };

  const formatPrice = (paisa: number) => (paisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

  // Dynamic calculations based on cart store (local preview)
  const subtotalBase = cartItems.reduce((acc, item) => acc + (item.basePrice * item.quantity), 0);
  const calculatedSubtotal = getSubtotal(); // final price
  
  const promoDiscount = subtotalBase - calculatedSubtotal; 
  const deliveryFee = calculatedSubtotal > 0 ? 6000 : 0;
  const grandTotal = calculatedSubtotal + deliveryFee;
  const totalSavings = promoDiscount;

  const handleProceedToCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Please login to checkout.');
      navigate('/login');
      return;
    }
    setSyncing(true);
    try {
      await syncCart(cartItems.map(i => ({ 
        combo_id: i.comboId, 
        quantity: i.quantity, 
        price_paisa: i.finalPrice, 
        name: i.comboName 
      })));
      navigate('/checkout');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to sync cart');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container cart-page">
        <h1 className="cart-title">Shopping Cart ({cartItems.length} Combo Packs)</h1>
        
        <div className="cart-layout">
          {/* Left Column: Item List */}
          <div className="cart-items-section">
            {cartItems.map(item => (
              <div className="cart-item-card" key={item.comboId}>
                <div className="cart-item-thumb" style={{ padding: 0, overflow: 'hidden' }}>
                  {item.image ? (
                    <img src={item.image} alt={item.comboName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>📦</div>
                  )}
                </div>
                <div className="cart-item-details">
                  <h3 className="item-name">{item.comboName}</h3>
                  <div className="item-includes">Includes: Combo Bundle</div>
                  <div className="item-unit-price">
                    Unit: BDT {formatPrice(item.finalPrice)} 
                    {item.basePrice > item.finalPrice && 
                      <span className="strike-price"> (Regular: {formatPrice(item.basePrice)})</span>
                    }
                  </div>
                  
                  <div className="item-controls-row">
                    <div className="quantity-selector-sm">
                      <span className="qty-label-sm">Quantity:</span>
                      <div className="qty-controls-sm">
                        <button onClick={() => handleQtyChange(item.comboId, -1)}>-</button>
                        <input type="text" value={item.quantity} readOnly />
                        <button onClick={() => handleQtyChange(item.comboId, 1)}>+</button>
                      </div>
                    </div>
                    
                    <div className="item-line-total">
                      Line Total: BDT {formatPrice(item.finalPrice * item.quantity)}
                    </div>
                  </div>
                  
                  <button className="btn-remove" onClick={() => handleRemove(item.comboId)}>Remove</button>
                </div>
              </div>
            ))}

            <div className="cart-actions-bottom">
              <Link to="/" className="btn-continue-shopping">← Continue Shopping Combos</Link>
              <button className="btn-clear-cart" onClick={clearCart}>Clear All Cart</button>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="cart-summary-section">
            <div className="summary-card sticky-summary">
              <h2 className="summary-title">Order Summary</h2>
              <hr className="summary-divider" />
              
              <div className="summary-row">
                <span>Subtotal (Base):</span>
                <span>BDT {formatPrice(subtotalBase)}</span>
              </div>
              <div className="summary-row highlight-red">
                <span>Overall Promo:</span>
                <span>-BDT {formatPrice(promoDiscount)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery (Dhaka):</span>
                <span>BDT {formatPrice(deliveryFee)}</span>
              </div>
              
              <hr className="summary-divider" />
              
              <div className="summary-row grand-total">
                <span>Estimated Total:</span>
                <span>BDT {formatPrice(grandTotal)}</span>
              </div>
              <div className="savings-alert">
                (You are saving BDT {formatPrice(totalSavings)})
              </div>

              <a href="#" className="btn-checkout" style={{display: 'block', textAlign: 'center'}} onClick={handleProceedToCheckout}>
                {syncing ? 'SYNCING CART...' : 'PROCEED TO CHECKOUT'}
              </a>

              <div className="summary-notes">
                <div className="note-item">ℹ️ Final discounts applied at checkout.</div>
                <div className="note-item">ℹ️ Safe Packaging Guaranteed</div>
                <div className="note-item">ℹ️ Pre-built packs only</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};