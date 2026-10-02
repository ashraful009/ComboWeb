import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './OrderSuccess.css';

export const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const state = location.state as { orderId: string, total: number } | null;
  const orderId = state?.orderId || 'ORD-260921-000123';
  const total = state?.total || 269500;
  
  const formatPrice = (paisa: number) => (paisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });
  return (
    <>
      {/* Header */}
      <header className="success-header">
        <div className="container header-container">
          <Link to="/" className="logo">
            <div className="logo-icon">🛒</div>
            <span>AggriGo</span>
          </Link>
          <div className="account-link">My Account</div>
        </div>
      </header>

      <div className="success-page-wrapper">
        <div className="container text-center mb-40">
          <h1 className="success-title">✓ ORDER CONFIRMED!</h1>
          <p className="success-subtitle">Thank you for shopping with Combo Grocery</p>
          <p className="order-meta-info">Order Number: <strong>{orderId}</strong> &bull; Placed on: {new Date().toLocaleString()}</p>
        </div>

        <div className="container status-banner">
          <div className="status-item">
            <span>ORDER STATUS:</span> <strong className="text-highlight">Pending Verification</strong>
          </div>
          <div className="status-divider">|</div>
          <div className="status-item">
            <span>Payment:</span> <strong>Paid via bKash (Trx: TRX98124)</strong>
          </div>
        </div>

        <div className="container main-content-card">
          
          {/* Delivery Timeline */}
          <div className="success-section-box">
            <h2 className="section-title">DELIVERY TIMELINE / NEXT STEPS</h2>
            <div className="timeline-container">
              <div className="timeline-step active">
                <div className="timeline-dot">●</div>
                <div className="timeline-label">Order Placed</div>
              </div>
              <div className="timeline-line"></div>
              <div className="timeline-step">
                <div className="timeline-dot"></div>
                <div className="timeline-label">Processing</div>
              </div>
              <div className="timeline-line"></div>
              <div className="timeline-step">
                <div className="timeline-dot"></div>
                <div className="timeline-label">Packed</div>
              </div>
              <div className="timeline-line"></div>
              <div className="timeline-step">
                <div className="timeline-dot"></div>
                <div className="timeline-label">Out for Delivery</div>
              </div>
            </div>
            <p className="estimated-delivery">Estimated delivery: <strong>Within 24 hours to Dhaka North Zone</strong></p>
          </div>

          {/* Order Snapshot */}
          <div className="success-section-box">
            <h2 className="section-title">ORDER SNAPSHOT (History Locked)</h2>
            <div className="snapshot-items">
              <div className="snapshot-header">Items Purchased:</div>
              
              <div className="snapshot-item-row">
                <div className="snapshot-item-details">
                  <div className="snapshot-item-name">&bull; Family Weekly Essentials Combo (x1)</div>
                  <div className="snapshot-item-includes">&nbsp;&nbsp;└ Contains: Rice 5kg, Oil 2L, Dal 1kg, Salt 1kg, Eggs 12pcs</div>
                </div>
                <div className="snapshot-item-price">BDT 1,080.00</div>
              </div>

              <div className="snapshot-item-row">
                <div className="snapshot-item-details">
                  <div className="snapshot-item-name">&bull; Breakfast Quick Starter Pack (x2)</div>
                  <div className="snapshot-item-includes">&nbsp;&nbsp;└ Contains: Bread 1 loaf, Jam 1 jar, Milk 1L, Eggs 1 doz</div>
                </div>
                <div className="snapshot-item-price">BDT 1,500.00</div>
              </div>
            </div>

            <hr className="snapshot-divider" />
            
            <div className="snapshot-summary-box">
              <div className="summary-row">
                <span>Subtotal (Base Price):</span>
                <span>BDT 3,100.00</span>
              </div>
              <div className="summary-row text-red">
                <span>Overall Campaign Discount:</span>
                <span>-BDT 310.00</span>
              </div>
              <div className="summary-row text-green">
                <span>Investor Member Savings:</span>
                <span>-BDT 155.00</span>
              </div>
              <div className="summary-row">
                <span>Delivery Charge:</span>
                <span>BDT 60.00</span>
              </div>
              
              <hr className="snapshot-divider" />
              
              <div className="summary-row grand-total">
                <span>Grand Total Paid:</span>
                <span>BDT {formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="success-section-box">
            <h2 className="section-title">SHIPPING DETAILS</h2>
            <div className="shipping-info">
              <div><strong>Recipient:</strong> Md Ashraful Islam (+8801700000000)</div>
              <div><strong>Address:</strong> Flat 4B, Road 12, Banani, Dhaka North, Dhaka - 1213</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="success-actions">
            <button className="btn-action-outline">TRACK ORDER TIMELINE</button>
            <button className="btn-action-outline">DOWNLOAD INVOICE (PDF)</button>
            <Link to="/" className="btn-action-primary">CONTINUE SHOPPING COMBOS</Link>
          </div>

          <div className="success-footer-note">
            ℹ️ A confirmation SMS and email have been sent with your order details and invoice.
          </div>

        </div>
      </div>
    </>
  );
};