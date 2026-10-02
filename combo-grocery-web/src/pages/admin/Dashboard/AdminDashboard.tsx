import React, { useEffect, useState } from 'react';
import { getDashboardStats, getPendingInvestors, getRecentOrders } from '../../../api/admin.api';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [investors, setInvestors] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, investorsData, ordersData] = await Promise.all([
          getDashboardStats().catch(() => null),
          getPendingInvestors().catch(() => []),
          getRecentOrders().catch(() => [])
        ]);
        setStats(statsData);
        setInvestors(investorsData ?? []);
        setOrders(ordersData ?? []);
      } catch (err) {
        console.error('Failed to load admin dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatPrice = (paisa: number) => (paisa / 100).toLocaleString('en-US', { minimumFractionDigits: 2 });

  if (loading) return <div className="dashboard-container" style={{ padding: '40px' }}>Loading Dashboard...</div>;
  if (!stats) return <div className="dashboard-container" style={{ padding: '40px', color: 'red' }}>Error loading dashboard data.</div>;

  return (
    <div className="dashboard-container">
      
      {/* Metric KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Today's Sales</div>
          <div className="kpi-value">৳{formatPrice(stats.todaysSalesPaisa)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Monthly Revenue</div>
          <div className="kpi-value">৳{formatPrice(stats.monthlyRevenuePaisa)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pending Orders</div>
          <div className={`kpi-value ${stats.pendingOrdersCount > 0 ? 'text-red' : ''}`}>{stats.pendingOrdersCount}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Low Stock Items</div>
          <div className={`kpi-value ${stats.lowStockItemsCount > 0 ? 'text-red' : ''}`}>{stats.lowStockItemsCount} Items</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Investors</div>
          <div className="kpi-value text-green">{stats.activeInvestorsCount} Members</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pending Reviews</div>
          <div className="kpi-value">{stats.pendingReviewsCount} Applications</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Combos</div>
          <div className="kpi-value">{stats.totalActiveCombos} Active</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Margin Health</div>
          <div className="kpi-value text-green">{stats.marginHealthPercent}% Avg</div>
        </div>
      </div>

      {/* Middle Section: Chart & Reviews */}
      <div className="dashboard-middle-grid">
        
        {/* Chart Card */}
        <div className="dashboard-card chart-card">
          <h3 className="card-title">Sales Trend (Last 30 Days)</h3>
          <div className="chart-placeholder">
            <span className="chart-icon">📈</span>
            <div className="chart-text">[ Line Chart: Revenue vs Discounts ]</div>
          </div>
        </div>

        {/* Investment Requests */}
        <div className="dashboard-card">
          <h3 className="card-title">Pending Investment Requests</h3>
          <ul className="investor-list">
            {investors.map((inv) => (
              <li key={inv.id}>
                <div className="inv-info">
                  <strong>{inv.name}</strong>
                  <span>{inv.plan} - ৳{formatPrice(inv.amount * 100)}</span>
                </div>
                <button className="btn-sm">Review</button>
              </li>
            ))}
            {investors.length === 0 && <li>No pending requests.</li>}
          </ul>
          <button className="btn-outline-full">Review Queue ({investors.length})</button>
        </div>

      </div>

      {/* Bottom Section: Recent Orders */}
      <div className="dashboard-card">
        <h3 className="card-title">RECENT ORDERS REQUIRING ACTION</h3>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Type</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  <td><span className={`badge-customer ${order.customerType.toLowerCase()}`}>{order.customerType}</span></td>
                  <td>৳{formatPrice(order.totalPaisa)}</td>
                  <td><span className={`badge-status ${order.status.toLowerCase()}`}>{order.status}</span></td>
                  <td>
                    {order.status === 'pending' ? (
                      <button className="btn-action">Process</button>
                    ) : (
                      <button className="btn-action assign">Assign Rider</button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={5} style={{textAlign: 'center'}}>No recent orders.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};