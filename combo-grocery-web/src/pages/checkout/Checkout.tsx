import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useCartStore } from '../../store/cart.store';
import { checkout, previewCheckout } from '../../api/order.api';
import { fetchDeliveryZones } from '../../api/delivery.api';
import './Checkout.css';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items: cartItems, clearCart, getTotalItems } = useCartStore();
  
  const [deliveryDetails, setDeliveryDetails] = useState({
    recipient_name: '',
    recipient_phone: '',
    street_address: ''
  });
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState('COD');
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  
  const [error, setError] = useState('');
  
  const formatPrice = (paisa: number) => (paisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

  const { data: zones = [] } = useQuery({
    queryKey: ['deliveryZones'],
    queryFn: fetchDeliveryZones,
  });

  // Default to first zone if none selected and zones are loaded
  React.useEffect(() => {
    if (zones.length > 0 && !selectedZoneId) {
      setSelectedZoneId(zones[0].id);
    }
  }, [zones, selectedZoneId]);

  const { data: previewData, isLoading: previewing, error: queryError } = useQuery({
    queryKey: ['checkoutPreview', appliedCoupon, selectedPayment, selectedZoneId],
    queryFn: () => previewCheckout({
      delivery_zone_id: selectedZoneId || 1, 
      ...(appliedCoupon ? { coupon_code: appliedCoupon } : {}),
      payment_method: selectedPayment,
    }),
    retry: 0,
    enabled: !!selectedZoneId,
  });

  const summary = previewData ? {
    subtotal: previewData.subtotal_paisa,
    delivery: previewData.delivery_fee_paisa,
    couponDiscount: previewData.coupon_discount_paisa,
    total: previewData.total_amount_paisa
  } : {
    subtotal: 0,
    delivery: 0,
    couponDiscount: 0,
    total: 0
  };

  const placeOrderMutation = useMutation({
    mutationFn: (orderData: any) => checkout(orderData),
    onSuccess: (res) => {
      clearCart();
      navigate('/order-success', { state: { orderId: res.orderNumber, total: res.totalAmount } });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to place order');
    }
  });

  const handleApplyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!coupon.trim()) return;
    setAppliedCoupon(coupon.trim());
  };

  const handlePlaceOrder = () => {
    if (!deliveryDetails.recipient_name || !deliveryDetails.recipient_phone || !deliveryDetails.street_address) {
      setError('Please fill out all delivery details');
      return;
    }
    if (!selectedZoneId) {
      setError('Please select a delivery zone');
      return;
    }
    setError('');

    const orderData = {
      recipient_name: deliveryDetails.recipient_name,
      recipient_phone: deliveryDetails.recipient_phone,
      street_address: deliveryDetails.street_address,
      delivery_zone_id: selectedZoneId,
      payment_method: selectedPayment,
      ...(appliedCoupon ? { coupon_code: appliedCoupon } : {}),
    };
    
    placeOrderMutation.mutate(orderData);
  };

  return (
    <>
      {/* Checkout Specific Header */}
      <header className="checkout-header">
        <div className="container header-container">
          <Link to="/" className="logo">
            <div className="logo-icon">🛒</div>
            <span>AggriGo</span>
          </Link>
          <div className="secure-badge">🔒 Secure Checkout (SSL / 256-bit Encrypted)</div>
          <div className="help-link">Help / FAQ</div>
        </div>
      </header>

      <div className="container breadcrumbs">
        <Link to="/cart">Cart</Link> &gt; <span>Checkout</span>
      </div>

      <div className="container checkout-page">
        {(error || queryError) && (
          <div style={{color: 'red', padding: '10px', backgroundColor: '#fee2e2', marginBottom: '15px'}}>
            {error || (queryError as any).response?.data?.message || 'An error occurred'}
          </div>
        )}
        <div className="checkout-layout">
          
          {/* Left Column: Workflow */}
          <div className="checkout-workflow">
            
            {/* 1. Address */}
            <div className="checkout-step-box">
              <h2 className="step-title">1. DELIVERY DETAILS</h2>
              <div className="step-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" placeholder="Full Name" value={deliveryDetails.recipient_name} onChange={e => setDeliveryDetails({...deliveryDetails, recipient_name: e.target.value})} style={{ padding: '10px', width: '100%' }} />
                <input type="text" placeholder="Phone Number" value={deliveryDetails.recipient_phone} onChange={e => setDeliveryDetails({...deliveryDetails, recipient_phone: e.target.value})} style={{ padding: '10px', width: '100%' }} />
                <textarea placeholder="Detailed Street Address" value={deliveryDetails.street_address} onChange={e => setDeliveryDetails({...deliveryDetails, street_address: e.target.value})} style={{ padding: '10px', width: '100%' }} rows={3} />
              </div>
            </div>

            {/* 2. Zone & Speed */}
            <div className="checkout-step-box">
              <h2 className="step-title">2. DELIVERY ZONE & SPEED</h2>
              <div className="step-content">
                <select className="zone-select" value={selectedZoneId || ''} onChange={(e) => setSelectedZoneId(Number(e.target.value))}>
                  <option value="" disabled>Select Delivery Zone</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>{zone.name} (Fee: BDT {formatPrice(zone.base_fee_paisa)})</option>
                  ))}
                </select>
                <textarea className="delivery-instructions" placeholder="Delivery instructions (e.g. Leave with security)" rows={2}></textarea>
              </div>
            </div>

            {/* 3. Coupon */}
            <div className="checkout-step-box">
              <h2 className="step-title">3. APPLY COUPON</h2>
              <div className="step-content">
                <div className="coupon-input-group">
                  <input 
                    type="text" 
                    value={coupon} 
                    onChange={(e) => setCoupon(e.target.value)} 
                    placeholder="Enter Coupon Code" 
                  />
                  <button onClick={handleApplyCoupon}>Apply</button>
                </div>
                {appliedCoupon && <div className="coupon-success">✓ {appliedCoupon} applied successfully</div>}
              </div>
            </div>

            {/* 4. Payment Method */}
            <div className="checkout-step-box">
              <h2 className="step-title">4. PAYMENT METHOD</h2>
              <div className="step-content">
                <label className="radio-row">
                  <input type="radio" name="payment" checked={selectedPayment === 'COD'} onChange={() => setSelectedPayment('COD')} />
                  <span>Cash on Delivery (COD)</span>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Order Snapshot */}
          <div className="checkout-summary-section">
            <div className="summary-card sticky-summary">
              <h2 className="summary-title">ORDER SUMMARY</h2>
              
              <div className="summary-items-preview">
                <div className="preview-header">{getTotalItems()} Items in Pack:</div>
                <ul className="preview-list">
                  {cartItems.map(item => (
                    <li key={item.comboId}>{item.comboName} (x{item.quantity})</li>
                  ))}
                </ul>
              </div>

              <hr className="summary-divider" />
              
              <div className="summary-row">
                <span>Subtotal (Base):</span>
                <span>BDT {formatPrice(summary.subtotal)}</span>
              </div>
              {summary.couponDiscount > 0 && (
                <div className="summary-row highlight-green">
                  <span>Coupon Discount:</span>
                  <span>-BDT {formatPrice(summary.couponDiscount)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Delivery Charge:</span>
                <span>BDT {formatPrice(summary.delivery)}</span>
              </div>
              
              <hr className="summary-divider" />
              
              <div className="summary-row grand-total">
                <span>Grand Total:</span>
                <span>BDT {formatPrice(summary.total)}</span>
              </div>

              <button 
                className="btn-place-order" 
                style={{display: 'block', width: '100%', textAlign: 'center'}}
                onClick={handlePlaceOrder}
                disabled={placeOrderMutation.isPending || previewing || cartItems.length === 0}
              >
                {placeOrderMutation.isPending ? 'PROCESSING...' : previewing ? 'CALCULATING...' : `PLACE ORDER (BDT ${formatPrice(summary.total)})`}
              </button>

              <div className="summary-notes">
                <div className="note-item">ℹ️ Prices are snapshot-locked.</div>
                <div className="note-item">ℹ️ Idempotency key verified.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};