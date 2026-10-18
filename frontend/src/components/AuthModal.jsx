import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, Phone, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Buyer');
  const [regPhone, setRegPhone] = useState('');
  const [regLocation, setRegLocation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleQuickFill = (role, email, pass) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.login(loginEmail, loginPassword);
      if (res.success) {
        localStorage.setItem('agri_token', res.token);
        localStorage.setItem('agri_user', JSON.stringify(res.user));
        onLoginSuccess(res.user);
        onClose();
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        phone: regPhone,
        location: regLocation,
      });

      if (res.success) {
        localStorage.setItem('agri_token', res.token);
        localStorage.setItem('agri_user', JSON.stringify(res.user));
        onLoginSuccess(res.user);
        onClose();
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div>
            <h3>Enterprise User Access & Authentication</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Secure Role-Based Logistics & Operations Portal
            </p>
          </div>
          <button onClick={onClose} style={{ color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button
            onClick={() => { setTab('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.85rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: tab === 'login' ? '#065f46' : '#64748b',
              borderBottom: tab === 'login' ? '3px solid #059669' : 'none',
              background: tab === 'login' ? '#ffffff' : 'transparent'
            }}
          >
            Sign In / Login
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.85rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: tab === 'register' ? '#065f46' : '#64748b',
              borderBottom: tab === 'register' ? '3px solid #059669' : 'none',
              background: tab === 'register' ? '#ffffff' : 'transparent'
            }}
          >
            Create Role Account
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {tab === 'login' ? (
            <div>
              {/* Demo 1-Click Credentials Bar */}
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#065f46', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                  ⚡ Quick Demo Login (Click to Autonfill):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('Admin', 'admin', 'admin123')}
                    style={{ background: '#ffffff', border: '1px solid #10b981', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <strong style={{ color: '#6d28d9', display: 'block' }}>👑 Admin (Full Access)</strong>
                    <span style={{ color: '#059669', fontSize: '0.72rem', fontWeight: '700' }}>User: admin / Pass: admin123</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('Driver', 'driver.carlos@agrilog.com', 'pass123')}
                    style={{ background: '#ffffff', border: '1px solid #10b981', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <strong style={{ color: '#059669', display: 'block' }}>🚚 Driver (Carlos M.)</strong>
                    <span style={{ color: '#64748b', fontSize: '0.72rem' }}>driver.carlos@...</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('Seller', 'seller.greenfarm@agrilog.com', 'pass123')}
                    style={{ background: '#ffffff', border: '1px solid #10b981', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <strong style={{ color: '#d97706', display: 'block' }}>🌾 Farm Seller</strong>
                    <span style={{ color: '#64748b', fontSize: '0.72rem' }}>seller.greenfarm@...</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('Buyer', 'buyer.sarah@agrilog.com', 'pass123')}
                    style={{ background: '#ffffff', border: '1px solid #10b981', padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <strong style={{ color: '#0284c7', display: 'block' }}>🛒 Buyer (Supermarket)</strong>
                    <span style={{ color: '#64748b', fontSize: '0.72rem' }}>buyer.sarah@...</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label>Login Username or Email:</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="admin or admin@agrilog.com"
                      required
                      style={{ paddingLeft: '2.4rem' }}
                    />
                    <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Password:</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="password" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{ paddingLeft: '2.4rem' }}
                    />
                    <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In to Portal'}
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label>Full Name / Company Name:</label>
                <input 
                  type="text" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g., Highland Valley Produce Co."
                  required
                />
              </div>

              <div className="form-group">
                <label>Official Email Address:</label>
                <input 
                  type="email" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g., manager@highlandvalley.com"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Role / Permission Level:</label>
                  <select value={regRole} onChange={(e) => setRegRole(e.target.value)}>
                    <option value="Admin">Admin (Full Control)</option>
                    <option value="Driver">Driver / Logistics Partner</option>
                    <option value="Seller">Seller (Agri Producer)</option>
                    <option value="Buyer">Buyer (Grocer / Terminal)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Phone Contact:</label>
                  <input 
                    type="text" 
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Warehouse / Farm Location:</label>
                <input 
                  type="text" 
                  value={regLocation}
                  onChange={(e) => setRegLocation(e.target.value)}
                  placeholder="e.g. Sector 9 Distribution Hub"
                />
              </div>

              <div className="form-group">
                <label>Password:</label>
                <input 
                  type="password" 
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create secure password"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Register User & Generate Access'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
