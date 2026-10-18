import React, { useState, useEffect } from 'react';
import { X, Search, User, Truck, Package, ShoppingBag, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

export default function GlobalSearchModal({ isOpen, onClose, initialQuery = '', onSelectShipment, onSelectUser }) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState({ users: [], drivers: [], shipments: [], products: [] });
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults({ users: [], drivers: [], shipments: [], products: [] });
      return;
    }
    setLoading(true);
    try {
      const data = await api.globalSearch(searchTerm);
      if (data.success) {
        setResults(data.results);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    performSearch(val);
  };

  if (!isOpen) return null;

  const totalCount = results.users.length + results.drivers.length + results.shipments.length + results.products.length;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div className="modal-header" style={{ padding: '1rem 1.5rem', background: '#064e3b', color: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1 }}>
            <Search size={20} color="#a7f3d0" />
            <input 
              type="text" 
              placeholder="Search users, drivers, orders, tracking #, or produce..." 
              value={query}
              onChange={handleInputChange}
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                color: '#ffffff',
                padding: '0.55rem 0.85rem'
              }}
            />
          </div>
          <button onClick={onClose} style={{ color: '#ffffff', marginLeft: '0.75rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          {['All', 'Shipments', 'Drivers', 'Users', 'Products'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: '600',
                background: activeFilter === f ? '#065f46' : '#ffffff',
                color: activeFilter === f ? '#ffffff' : '#64748b',
                border: '1px solid #e2e8f0'
              }}
            >
              {f}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b', alignSelf: 'center' }}>
            {totalCount} results found
          </div>
        </div>

        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Searching database...</div>
          ) : totalCount === 0 && query.trim() !== '' ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              No matches found for "{query}".
            </div>
          ) : null}

          {/* Shipments Section */}
          {(activeFilter === 'All' || activeFilter === 'Shipments') && results.shipments.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#065f46', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                📦 Shipments & Orders ({results.shipments.length})
              </div>
              {results.shipments.map(s => (
                <div 
                  key={s.id || s._id} 
                  onClick={() => {
                    if (onSelectShipment) onSelectShipment(s);
                    onClose();
                  }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.45rem', cursor: 'pointer', background: '#ffffff', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  <div>
                    <strong style={{ color: '#0f172a' }}>{s.productName} ({s.weightKg} kg)</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Tracking: {s.trackingNumber} • Buyer: {s.buyerName}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`status-pill status-${s.status.toLowerCase().replace('-', '')}`}>
                      {s.status}
                    </span>
                    <ArrowRight size={16} color="#059669" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Drivers Section */}
          {(activeFilter === 'All' || activeFilter === 'Drivers') && results.drivers.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#065f46', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                🚚 Delivery Drivers ({results.drivers.length})
              </div>
              {results.drivers.map(d => (
                <div key={d.id || d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.45rem', background: '#ffffff' }}>
                  <div>
                    <strong>{d.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {d.vehicleType} • {d.vehicleNumber} • Loc: {d.currentLocation}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: d.status === 'Available' ? '#059669' : '#d97706' }}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Users Section */}
          {(activeFilter === 'All' || activeFilter === 'Users') && results.users.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#065f46', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                👥 System Users ({results.users.length})
              </div>
              {results.users.map(u => (
                <div key={u.id || u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.45rem', background: '#ffffff' }}>
                  <div>
                    <strong>{u.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{u.email} • {u.location}</div>
                  </div>
                  <span className={`role-badge role-${u.role.toLowerCase()}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Products Section */}
          {(activeFilter === 'All' || activeFilter === 'Products') && results.products.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#065f46', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                🌾 Food Products & Produce ({results.products.length})
              </div>
              {results.products.map(p => (
                <div key={p.id || p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.45rem', background: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                    <div>
                      <strong>{p.name}</strong>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.category} • Origin: {p.origin}</div>
                    </div>
                  </div>
                  <strong style={{ color: '#059669' }}>
                    ${p.pricePerKg.toFixed(2)} / 1 kg
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
