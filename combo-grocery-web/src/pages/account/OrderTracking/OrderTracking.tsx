import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AccountLayout } from '../../../components/AccountLayout/AccountLayout';
import { trackOrder } from '../../../api/order.api';
import './OrderTracking.css';

export const OrderTracking: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) return;
      try {
        const data = await trackOrder(orderNumber);
        setOrderData(data);
      } catch (err) {
        console.warn('Failed to fetch real order data.', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  if (loading) return <AccountLayout><div style={{padding: '40px'}}>Loading tracking details...</div></AccountLayout>;
  if (!orderData) return <AccountLayout><div style={{padding: '40px'}}>Order not found.</div></AccountLayout>;

  const formatPrice = (paisa: number) => (paisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <AccountLayout>
      
      <div className="tracking-breadcrumbs">
        Account &gt; Orders &gt; <span>Order #{orderData.order_number}</span>
      </div>

      <div className="account-dashboard">
        
        {/* Live Status Timeline */}
        <div className="account-card tracking-card">
          <h3 className="card-title">LIVE STATUS TIMELINE</h3>
          
          <div className="status-timeline-container">
            <div className="timeline-nodes">
              
              {/* Placed / Pending */}
              <div className={`t-node ${orderData.status !== 'pending' ? 'completed' : 'active'}`}>
                <div className="t-icon">✓</div>
                <div className="t-label">Placed</div>
              </div>
              
              <div className={`t-line ${orderData.status !== 'pending' ? 'completed' : 'active'}`}></div>
              
              {/* Confirmed */}
              <div className={`t-node ${orderData.status === 'confirmed' || orderData.status === 'shipped' || orderData.status === 'delivered' ? 'completed' : 'pending'}`}>
                <div className="t-icon">✓</div>
                <div className="t-label">Confirmed</div>
              </div>
              
              <div className={`t-line ${orderData.status === 'shipped' || orderData.status === 'delivered' ? 'completed' : 'pending'}`}></div>
              
              {/* Shipped */}
              <div className={`t-node ${orderData.status === 'shipped' ? 'active pulse' : (orderData.status === 'delivered' ? 'completed' : 'pending')}`}>
                <div className="t-icon">●</div>
                <div className="t-label">Out for Delivery</div>
              </div>

              <div className={`t-line ${orderData.status === 'delivered' ? 'completed' : 'pending'}`}></div>

              {/* Delivered */}
              <div className={`t-node ${orderData.status === 'delivered' ? 'completed' : 'pending'}`}>
                <div className="t-icon">✓</div>
                <div className="t-label">Delivered</div>
              </div>
            </div>
          </div>

          <div className="rider-info-box">
            <span><strong>Recipient:</strong> {orderData.recipient_name} ({orderData.recipient_phone})</span>
            <span className="rider-divider">•</span>
            <span><strong>Delivery Address:</strong> {orderData.shipping_address}</span>
          </div>
        </div>

        {/* Order Composition & Snapshot */}
        <div className="account-card composition-card">
          <h3 className="card-title">ORDER COMPOSITION & SNAPSHOT</h3>
          
          <div className="table-responsive">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Combo Item</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Unit Price</th>
                  <th className="text-right">Total Price</th>
                </tr>
              </thead>
              <tbody>
                {orderData.items.map((item: any) => (
                  <tr key={item.id}>
                    <td>
                      <div className="item-name">{item.combo_name}</div>
                    </td>
                    <td className="text-center font-bold">{item.quantity}</td>
                    <td className="text-right">
                      <div className="unit-price">৳{formatPrice(item.unit_price_paisa)}</div>
                    </td>
                    <td className="text-right font-bold">৳{formatPrice(item.line_total_paisa)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="order-summary-box">
            <div className="summary-row">
              <span>Subtotal (Base):</span>
              <span>৳{formatPrice(orderData.subtotal_paisa)}</span>
            </div>
            {orderData.coupon_discount_paisa > 0 && (
              <div className="summary-row text-red">
                <span>Coupon Discount:</span>
                <span>-৳{formatPrice(orderData.coupon_discount_paisa)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Delivery Charge:</span>
              <span>৳{formatPrice(orderData.delivery_fee_paisa)}</span>
            </div>
            
            <hr className="summary-divider" />
            
            <div className="summary-row grand-total">
              <span>Grand Total:</span>
              <span>৳{formatPrice(orderData.total_amount_paisa)} <span className="paid-tag">[{orderData.status}]</span></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="tracking-actions">
          <button className="btn-action-primary">RE-ORDER THIS COMBO PACK</button>
          <button className="btn-action-outline">DOWNLOAD INVOICE (PDF)</button>
          <button className="btn-action-danger">NEED HELP / CANCEL</button>
        </div>

      </div>
    </AccountLayout>
  );
};