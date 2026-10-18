import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AgriStore from './components/AgriStore';
import LogisticsDashboard from './components/LogisticsDashboard';
import AuthModal from './components/AuthModal';
import GlobalSearchModal from './components/logistics/GlobalSearchModal';
import { api } from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState('store'); // 'store' | 'logistics'
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState('login');
  const [postAuthTargetView, setPostAuthTargetView] = useState(null);

  // Global Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');

  // Selected item from search or store
  const [selectedShipment, setSelectedShipment] = useState(null);

  useEffect(() => {
    // Check saved login session
    const savedUser = localStorage.getItem('agri_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('agri_user');
      }
    }
  }, []);

  const handleOpenAuth = (tab = 'login', targetView = null) => {
    setAuthInitialTab(tab);
    setPostAuthTargetView(targetView);
    setIsAuthOpen(true);
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    if (postAuthTargetView) {
      setCurrentView(postAuthTargetView);
      setPostAuthTargetView(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('agri_token');
    localStorage.removeItem('agri_user');
    setUser(null);
    setCurrentView('store');
  };

  const handleOpenSearch = (initialQuery = '') => {
    setSearchInitialQuery(initialQuery);
    setIsSearchOpen(true);
  };

  return (
    <div className="agri-app-container">
      {/* Required Green Navbar with Right-Side Sign In/Login */}
      <Navbar 
        user={user}
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'logistics' && !user) {
            handleOpenAuth('login', 'logistics');
          } else {
            setCurrentView(view);
          }
        }}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenSearch={handleOpenSearch}
      />

      {/* Main Content Area */}
      {currentView === 'store' ? (
        <AgriStore 
          onNavigateToLogistics={() => {
            if (!user) {
              handleOpenAuth('login', 'logistics');
            } else {
              setCurrentView('logistics');
            }
          }}
          onShipmentCreated={(newShipment) => {
            setSelectedShipment(newShipment);
          }}
        />
      ) : (
        <LogisticsDashboard 
          user={user}
          onNavigateToStore={() => setCurrentView('store')}
          onOpenGlobalSearch={() => setIsSearchOpen(true)}
        />
      )}

      {/* Auth Modal with Role Presets & Specific Credentials */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialTab={authInitialTab}
      />

      {/* Global Multi-Entity Search Modal across Users, Drivers, Orders, Produce */}
      <GlobalSearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialQuery={searchInitialQuery}
        onSelectShipment={(shp) => {
          if (!user) {
            handleOpenAuth('login', 'logistics');
          } else {
            setCurrentView('logistics');
          }
        }}
      />
    </div>
  );
}
