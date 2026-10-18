import React, { useState } from 'react';
import { 
  Sprout, 
  Search, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  Truck, 
  User, 
  Store,
  ChevronRight,
  Layers
} from 'lucide-react';

export default function Navbar({ 
  user, 
  currentView, 
  onNavigate, 
  onOpenAuth, 
  onLogout,
  onOpenSearch 
}) {
  const [quickSearch, setQuickSearch] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onOpenSearch) {
      onOpenSearch(quickSearch);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'role-admin';
      case 'driver': return 'role-driver';
      case 'seller': return 'role-seller';
      default: return 'role-buyer';
    }
  };

  return (
    <nav className="agri-navbar">
      <div className="nav-container">
        {/* Brand / Logo */}
        <div className="brand-wrapper" onClick={() => onNavigate('store')}>
          <div className="brand-logo-icon">
            <Sprout size={26} strokeWidth={2.4} />
          </div>
          <div>
            <div className="brand-title">
              AgriFresh
              <span className="brand-badge">LOGISTICS</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#a7f3d0', fontWeight: '500' }}>
              Farm Direct & Smart Fleet
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <form className="nav-search-bar" onSubmit={handleSearchSubmit}>
          <Search size={18} className="nav-search-icon" />
          <input 
            type="text" 
            placeholder="Search produce, drivers, orders, or tracking #..." 
            className="nav-search-input"
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
          />
        </form>

        {/* Navigation Action Buttons */}
        <div className="nav-actions">
          {/* Marketplace Tab */}
          <button 
            className={`nav-pill-btn ${currentView === 'store' ? 'active-store' : ''}`}
            onClick={() => onNavigate('store')}
            title="Browse Agricultural Produce"
          >
            <Store size={17} />
            <span>Produce Store</span>
          </button>

          {/* User & Logistics Management Portal Tab */}
          <button 
            className="nav-pill-btn"
            style={{
              backgroundColor: currentView === 'logistics' ? '#ffffff' : 'rgba(255, 255, 255, 0.18)',
              color: currentView === 'logistics' ? '#064e3b' : '#ffffff',
              fontWeight: '700'
            }}
            onClick={() => {
              if (!user) {
                onOpenAuth('login', 'logistics');
              } else {
                onNavigate('logistics');
              }
            }}
            title="Access User & Logistics Management"
          >
            <Truck size={17} />
            <span>Logistics Portal</span>
          </button>

          {/* User Profile / Login Option on the Right */}
          {user ? (
            <div className="nav-user-profile" onClick={() => onNavigate('logistics')}>
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.email || 'Admin')}`} 
                alt={user.name || 'User'} 
                className="nav-avatar"
              />
              <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                <div style={{ fontSize: '0.825rem', fontWeight: '700', color: '#ffffff' }}>
                  {typeof user.name === 'string' && user.name.trim() ? user.name.split(' ')[0] : (user.email ? user.email.split('@')[0] : 'Admin')}
                </div>
                <span className={`role-badge ${getRoleBadgeClass(user.role || 'Admin')}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                  {user.role || 'Admin'}
                </span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onLogout();
                }}
                title="Sign Out"
                style={{ color: '#fca5a5', padding: '0.2rem', marginLeft: '0.25rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              className="nav-auth-btn"
              onClick={() => onOpenAuth('login')}
              id="btn-nav-signin"
            >
              <LogIn size={18} />
              <span>Sign In / Login</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
