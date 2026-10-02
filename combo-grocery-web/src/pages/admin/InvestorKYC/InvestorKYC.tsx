import React, { useState } from 'react';
import { AdminLayout } from '../../../components/AdminLayout/AdminLayout';
import { reviewInvestorApplication } from '../../../api/admin.api';
import './InvestorKYC.css';

export const InvestorKYC: React.FC = () => {
  const [isNidDecrypted, setIsNidDecrypted] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
    setLoading(true);
    setError('');
    try {
      // In a real flow, this ID (1) would come from the URL params or props
      await reviewInvestorApplication(1, status, internalNote);
      alert(`Application ${status} successfully!`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="builder-breadcrumbs">
        Admin &gt; Investment &gt; <span>Review Request #INV-APP-2026-089</span>
      </div>

      <div className="kyc-header-card">
        <div className="kyc-header-item">
          <span className="kyc-label">Customer:</span>
          <span className="kyc-value">Md Ashraful Islam</span>
        </div>
        <div className="kyc-divider"></div>
        <div className="kyc-header-item">
          <span className="kyc-label">Applied Plan:</span>
          <span className="kyc-value plan-gold">Gold Membership (৳25,000)</span>
        </div>
        <div className="kyc-divider"></div>
        <div className="kyc-header-item">
          <span className="kyc-label">Status:</span>
          <span className="kyc-value status-pending">PENDING REVIEW</span>
        </div>
      </div>

      <div className="kyc-grid">
        
        {/* Left Column */}
        <div className="kyc-col">
          
          <div className="admin-card mb-4">
            <h2 className="admin-card-title">1. APPLICANT DETAILS</h2>
            <div className="data-row">
              <span className="data-label">Full Name:</span>
              <span className="data-value">Md Ashraful Islam</span>
            </div>
            <div className="data-row">
              <span className="data-label">Phone:</span>
              <span className="data-value">+8801700000000</span>
            </div>
            <div className="data-row">
              <span className="data-label">Email:</span>
              <span className="data-value">ashraful@example.com</span>
            </div>
            <div className="data-row">
              <span className="data-label">Customer Since:</span>
              <span className="data-value">Jan 2024</span>
            </div>
            <div className="data-row">
              <span className="data-label">Orders Done:</span>
              <span className="data-value font-bold">16 Orders</span>
            </div>
          </div>

          <div className="admin-card">
            <h2 className="admin-card-title">4. PAYMENT PROOF</h2>
            <div className="data-row">
              <span className="data-label">Method:</span>
              <span className="data-value">Bank Transfer (Islami Bank)</span>
            </div>
            <div className="data-row">
              <span className="data-label">Reference:</span>
              <span className="data-value font-mono">TRX87491294821</span>
            </div>
            <div className="data-row">
              <span className="data-label">Amount:</span>
              <span className="data-value text-green font-bold">৳25,000.00</span>
            </div>
            <div className="data-row mt-4">
              <span className="data-label">Proof Doc:</span>
              <button className="btn-link">[View Bank Deposit Slip.pdf]</button>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="kyc-col">
          
          <div className="admin-card mb-4">
            <h2 className="admin-card-title">2. KYC VERIFICATION</h2>
            <div className="data-row align-center">
              <span className="data-label">NID Number:</span>
              {isNidDecrypted ? (
                <span className="data-value font-mono font-bold">19982637482910</span>
              ) : (
                <button className="btn-decrypt" onClick={() => setIsNidDecrypted(true)}>
                  [ Decrypt NID (Audited) ]
                </button>
              )}
            </div>
            <div className="data-row mt-2">
              <span className="data-label">Date of Birth:</span>
              <span className="data-value">14 March 1998</span>
            </div>
            <div className="data-row mt-2">
              <span className="data-label">Nominee Name:</span>
              <span className="data-value">Mst Rokhsana Begum</span>
            </div>
            <div className="data-row">
              <span className="data-label">Nominee Phone:</span>
              <span className="data-value">+8801800000000</span>
            </div>
          </div>

          <div className="admin-card mb-4">
            <h2 className="admin-card-title">3. DOCUMENTS ATTACHED</h2>
            <div className="doc-preview-grid">
              <div className="doc-box">
                <div className="doc-placeholder">[Front NID Card Preview]</div>
              </div>
              <div className="doc-box">
                <div className="doc-placeholder">[Back NID Card Preview]</div>
              </div>
            </div>
            <div className="watermark-note">(Watermarked for Admin Audit)</div>
          </div>

          <div className="admin-card">
            <h2 className="admin-card-title">5. ADMIN REVIEW ACTIONS</h2>
            {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
            <div className="form-group-col mb-4">
              <label>Internal Note:</label>
              <textarea 
                rows={3} 
                placeholder="Type audit notes here..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
              ></textarea>
            </div>
            
            <div className="action-buttons-row">
              <button className="btn-approve" onClick={() => handleReview('APPROVED')} disabled={loading}>
                {loading ? 'PROCESSING...' : '✓ APPROVE & ACTIVATE'}
              </button>
              <button className="btn-reject" onClick={() => handleReview('REJECTED')} disabled={loading}>
                {loading ? 'PROCESSING...' : '✕ REJECT REQUEST'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};