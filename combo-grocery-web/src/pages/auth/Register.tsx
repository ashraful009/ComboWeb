import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/auth.store';
import './Auth.css';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const nameParts = formData.full_name.trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      // 1. Register User
      await apiClient.post('/auth/register', {
        first_name: firstName,
        last_name: lastName,
        phone: formData.phone_number,
        password: formData.password
      });

      // 2. Auto Login after registration
      const loginRes = await apiClient.post('/auth/login', {
        phone: formData.phone_number,
        password: formData.password
      });

      const { token, user } = loginRes.data.data;
      setAuth(token, user);
      
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-split-container">
        
        {/* Left Side: Form */}
        <div className="auth-form-side">
          <div className="auth-logo-area">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="brand-leaf">
              <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22Z" fill="#059669"/>
              <path d="M12 22V12" stroke="white" strokeWidth="1.5"/>
            </svg>
            <div className="brand-text-col">
              <span className="brand-name">AgriGo</span>
              <span className="brand-tagline">Smart Farming • Better Tomorrow</span>
            </div>
          </div>

          <div className="auth-heading-area">
            <h2>Create an Account</h2>
            <p className="auth-subtitle">Join AgriGo today and be part of a smarter farming community.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleRegister} className="auth-form">
            
            {/* Full Name */}
            <div className="form-group-register">
              <div className="register-icon-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="register-input-col">
                <label>Full Name</label>
                <div className="input-wrapper-register">
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div className="form-group-register">
              <div className="register-icon-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div className="register-input-col">
                <label>Phone Number</label>
                <div className="input-wrapper-register">
                  <input 
                    type="text" 
                    placeholder="e.g. +8801700000000"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="form-group-register">
              <div className="register-icon-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div className="register-input-col">
                <label>Email (Optional)</label>
                <div className="input-wrapper-register">
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="form-group-register">
              <div className="register-icon-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div className="register-input-col">
                <label>Password</label>
                <div className="input-wrapper-register">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    minLength={6}
                  />
                  <button 
                    type="button" 
                    className="icon-btn right-icon" 
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-auth-modern" disabled={loading}>
              <span style={{flex: 1}}></span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              <span>{loading ? 'Registering...' : 'REGISTER'}</span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
              <span style={{flex: 1}}></span>
            </button>
          </form>

          <div className="auth-footer-modern">
            <span className="divider-line"></span>
            <p>Already have an account?</p>
            <span className="divider-line"></span>
          </div>
          <div className="auth-register-link">
            <Link to="/login">Login here →</Link>
          </div>
        </div>

        {/* Right Side: Features/Image */}
        <div className="auth-image-side">
          <div className="image-overlay-text">
            <h1 className="script-font">Grow Together</h1>
            
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon-circle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22Z" fill="#059669"/>
                    <path d="M12 22V12" stroke="white" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h4>Better Farmers</h4>
                  <p>More knowledge, better yields.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-circle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22Z" fill="#059669"/>
                    <path d="M12 22V12" stroke="white" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h4>Healthier Crops</h4>
                  <p>Quality today, prosperity tomorrow.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-circle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22Z" fill="#059669"/>
                    <path d="M12 22V12" stroke="white" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h4>A Greener Future</h4>
                  <p>Sustainable farming for generations.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};