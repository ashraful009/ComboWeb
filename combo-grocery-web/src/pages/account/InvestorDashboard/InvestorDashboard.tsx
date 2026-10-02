import React, { useEffect, useState } from 'react';
import { AccountLayout } from '../../../components/AccountLayout/AccountLayout';
import { getInvestmentDashboard, getInvestmentPayments, getInvestmentSavings } from '../../../api/investment.api';
import type { InvestmentDashboard, MonthlySavings, InvestmentPayment } from '../../../types';
import './InvestorDashboard.css';

export const InvestorDashboard: React.FC = () => {
  const [data, setData] = useState<InvestmentDashboard | null>(null);
  const [savings, setSavings] = useState<MonthlySavings[]>([]);
  const [payments, setPayments] = useState<InvestmentPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestmentData = async () => {
      try {
        const [dashboardData, paymentsData, savingsData] = await Promise.all([
          getInvestmentDashboard(),
          getInvestmentPayments(),
          getInvestmentSavings()
        ]);
        setData(dashboardData);
        setPayments(paymentsData);
        setSavings(savingsData);
      } catch (err) {
        console.warn('Failed to fetch real investment data.', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchInvestmentData();
  }, []);

  if (loading) return <AccountLayout><div style={{padding: '40px'}}>Loading dashboard...</div></AccountLayout>;
  if (!data) return <AccountLayout><div style={{padding: '40px'}}>No active investments found. <a href="/apply" style={{color: 'var(--primary-green)', textDecoration: 'underline'}}>Apply for an investment</a> to see your dashboard.</div></AccountLayout>;

  return (
    <AccountLayout>
      <div className="account-dashboard">
        
        <div className="account-card status-banner-card">
          <div className="banner-top-row">
            <div className="banner-col">
              <div className="banner-label">MEMBERSHIP STATUS:</div>
              <div className="banner-value status-active">[ {data.status} ]</div>
            </div>
            <div className="banner-col right-align">
              <div className="banner-label">Plan:</div>
              <div className="banner-value plan-name">{data.planName}</div>
            </div>
          </div>
          
          <div className="banner-divider"></div>
          
          <div className="banner-details-grid">
            <div className="detail-item">
              <div className="detail-label">Active Discount:</div>
              <div className="detail-value text-green">{data.discount} Extra on Every Combo</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Expiry Date:</div>
              <div className="detail-value">{data.expiryDate} (Lifetime/Annual)</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Total Invested:</div>
              <div className="detail-value">৳{data.totalInvested.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Total Savings Earned:</div>
              <div className="detail-value font-bold text-green">৳{data.totalSavings.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            </div>
          </div>
        </div>

        {/* Savings & Benefits Summary */}
        <div className="account-card benefits-card">
          <h3 className="card-title">SAVINGS & BENEFITS SUMMARY</h3>
          
          <div className="savings-breakdown">
            <h4 className="breakdown-title">Monthly Savings Breakdown:</h4>
            <ul className="breakdown-list">
              {savings.length > 0 ? savings.map((s, idx) => (
                <li key={idx}>
                  <span className="bullet">•</span>
                  <strong>{s.month}:</strong> ৳{(s.total_savings_paisa / 100).toLocaleString('en-US', {minimumFractionDigits: 2})} saved <span className="sub-text">({s.order_count} Combo orders)</span>
                </li>
              )) : (
                <li>No savings recorded yet.</li>
              )}
            </ul>
          </div>

          <div className="rule-applied-box">
            <span className="rule-icon">ℹ️</span>
            <span><strong>Rule Applied:</strong> Stacking Mode [Additive: Base - Overall Discount - (Base x 8%)]</span>
          </div>
        </div>

        {/* Investment Actions & Lifecycle */}
        <div className="account-card lifecycle-card">
          <h3 className="card-title">INVESTMENT ACTIONS & LIFECYCLE</h3>
          
          <div className="lifecycle-info">
            <div className="info-row">
              <span className="info-label">Lock-in Period:</span>
              <span className="info-value">{data.lockInDays} Days (Remaining: <strong className="text-orange">{data.remainingDays} Days</strong>)</span>
            </div>
            <div className="info-row">
              <span className="info-label">Refund Eligibility:</span>
              <span className="info-value text-red">Non-refundable during lock-in period</span>
            </div>
          </div>

          <div className="action-buttons-container">
            <button className="btn-action-primary">+ Top-up / Upgrade Plan</button>
            <button className="btn-action-outline">View Order Savings</button>
            <button className="btn-action-danger">Request Refund</button>
          </div>
        </div>

        {/* Investment Payment History */}
        <div className="account-card history-card">
          <h3 className="card-title">INVESTMENT PAYMENT HISTORY</h3>
          
          <div className="table-responsive">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Trx ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? payments.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.transaction_id || `INV-${p.id}`}</strong></td>
                    <td>Investment</td>
                    <td className="font-bold">৳{(p.amount_paisa / 100).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td>{p.payment_method.replace('_', ' ')}</td>
                    <td><span className={`status-badge ${p.status === 'approved' ? 'approved' : 'pending'}`}>{p.status}</span></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center' }}>No payments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AccountLayout>
  );
};