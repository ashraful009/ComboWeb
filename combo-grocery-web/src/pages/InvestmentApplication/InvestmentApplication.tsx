import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
import { applyForInvestment, getActiveCampaigns } from '../../api/investment.api';
import './InvestmentApplication.css';

export const InvestmentApplication: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

  const [legalName, setLegalName] = useState('Md. Ashraful Islam');
  const [nidNumber, setNidNumber] = useState('19982691234567890');
  const [dob, setDob] = useState('1998-03-14');
  const [nomineeName, setNomineeName] = useState('Mst Rokhsana Begum');
  const [nomineePhone, setNomineePhone] = useState('+8801800000000');
  const [amount, setAmount] = useState('25000');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [trxId, setTrxId] = useState('TRX87491294821');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getActiveCampaigns();
        if (data.length > 0) {
          setSelectedCampaignId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load campaigns', err);
      }
    };
    fetchCampaigns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId) {
      setError('No active investment campaigns available.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await applyForInvestment({
        campaign_id: selectedCampaignId,
        amount_paisa: parseFloat(amount) * 100,
        payment_method: paymentMethod,
      });
      
      alert('Application submitted successfully!');
      navigate('/account/investor');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Header />
      
      <div className="container app-breadcrumbs">
        Apply for Investor Membership &gt; <span>Step 1 of 3: KYC & Payment Verification</span>
      </div>

      <div className="app-page-wrapper">
        <div className="app-container">
          
          <div className="plan-selection-banner">
            <span className="plan-label">Selected Plan:</span>
            <span className="plan-title">GOLD MEMBERSHIP (৳25,000 Minimum • 8% Investor Discount)</span>
          </div>
          
          {error && <div style={{color: 'red', padding: '10px', backgroundColor: '#fee2e2', marginBottom: '15px'}}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* 1. Applicant KYC Details */}
          <div className="app-section">
            <h2 className="app-section-title">1. APPLICANT KYC DETAILS</h2>
            
            <div className="form-grid">
              <div className="form-group-col">
                <label>Full Legal Name (as per NID):</label>
                <input type="text" value={legalName} onChange={(e) => setLegalName(e.target.value)} required />
              </div>
              <div className="form-group-col">
                <label>National ID (NID) Number:</label>
                <input type="text" value={nidNumber} onChange={(e) => setNidNumber(e.target.value)} required />
              </div>
              <div className="form-group-col">
                <label>Date of Birth:</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
              </div>
              <div className="form-group-col"></div>
              
              <div className="form-group-col">
                <label>Nominee Full Name:</label>
                <input type="text" value={nomineeName} onChange={(e) => setNomineeName(e.target.value)} required />
              </div>
              <div className="form-group-col">
                <label>Nominee Contact Phone:</label>
                <input type="text" value={nomineePhone} onChange={(e) => setNomineePhone(e.target.value)} required />
              </div>
            </div>
          </div>

          {/* 2. NID Document Upload */}
          <div className="app-section">
            <h2 className="app-section-title">2. NID DOCUMENT UPLOAD <span className="title-note">(Private & Encrypted Storage)</span></h2>
            
            <div className="upload-row">
              <span className="upload-label">Front Side of NID:</span>
              <button className="btn-upload-outline">Upload File (JPG/PNG/PDF)</button>
              <span className="upload-success">✓ nid_front_enc.jpg</span>
            </div>
            
            <div className="upload-row mt-3">
              <span className="upload-label">Back Side of NID:</span>
              <button className="btn-upload-outline">Upload File (JPG/PNG/PDF)</button>
              <span className="upload-success">✓ nid_back_enc.jpg</span>
            </div>
          </div>

          {/* 3. Investment Payment */}
          <div className="app-section">
            <h2 className="app-section-title">3. INVESTMENT PAYMENT</h2>
            
            <div className="form-group-row-align">
              <label>Investment Amount:</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="amount-input" min="25000" required />
              <span className="input-note">(Min: ৳25,000.00)</span>
            </div>

            <div className="payment-gateway-section mt-4">
              <label className="section-sub-label">Payment Gateway / Method:</label>
              <div className="radio-group-horizontal">
                <label className="radio-opt">
                  <input type="radio" name="payMethod" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} /> 
                  Direct Bank Transfer (IBBL, City Bank)
                </label>
                <label className="radio-opt">
                  <input type="radio" name="payMethod" checked={paymentMethod === 'bkash'} onChange={() => setPaymentMethod('bkash')} /> 
                  bKash Merchant
                </label>
                <label className="radio-opt">
                  <input type="radio" name="payMethod" checked={paymentMethod === 'nagad'} onChange={() => setPaymentMethod('nagad')} /> 
                  Nagad Gateway
                </label>
              </div>
            </div>

            {paymentMethod === 'bank' && (
              <div className="bank-details-box mt-4">
                <div className="bank-details-title">If Bank Transfer:</div>
                <div className="form-group-row-align mt-3">
                  <label>Bank Reference / Trx ID:</label>
                  <input type="text" value={trxId} onChange={(e) => setTrxId(e.target.value)} className="trx-input" required />
                </div>
                <div className="upload-row mt-3">
                  <span className="upload-label">Attach Deposit Receipt:</span>
                  <button className="btn-upload-outline">Upload Receipt Slip</button>
                  <span className="upload-success">✓ deposit_slip.pdf</span>
                </div>
              </div>
            )}
          </div>

          <div className="terms-checkbox-section">
            <label className="terms-label">
              <input type="checkbox" defaultChecked />
              <span>I agree to the Investor Terms & Conditions (Version 2.1) and understand the 180-day lock-in.</span>
            </label>
          </div>

          <div className="app-actions">
            <Link to="/" className="btn-cancel">CANCEL</Link>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'SUBMITTING...' : 'SUBMIT APPLICATION FOR APPROVAL'}
            </button>
          </div>
          </form>

          <div className="app-footer-note">
            ℹ️ Admin review typically takes 24 to 48 working hours. Access is audited under KYC privacy.
          </div>

        </div>
      </div>
    </>
  );
};