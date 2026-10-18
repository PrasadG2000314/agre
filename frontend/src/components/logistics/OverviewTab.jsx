import React from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  PlusCircle, 
  MapPin, 
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function OverviewTab({ 
  kpis, 
  shipments, 
  drivers, 
  onRunAutoDispatch, 
  onOpenCreateShipment, 
  onSelectShipment 
}) {
  const safeShipments = Array.isArray(shipments) ? shipments : [];
  const safeDrivers = Array.isArray(drivers) ? drivers : [];
  const activeShipments = safeShipments.filter(s => s && (s.status === 'In-Transit' || s.status === 'Dispatched'));
  const pendingShipments = safeShipments.filter(s => s && s.status === 'Pending');

  return (
    <div>
      {/* KPI Cards Row */}
      <div className="kpi-cards-grid">
        <div className="kpi-card">
          <div className="kpi-meta">
            <h4>Active In-Transit</h4>
            <div className="kpi-number">{kpis?.activeInTransit ?? activeShipments.length}</div>
            <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '600', marginTop: '0.2rem' }}>
              Climate-Controlled Cold Chain
            </div>
          </div>
          <div className="kpi-icon-wrap kpi-icon-blue">
            <Truck size={26} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-meta">
            <h4>Pending Driver Dispatch</h4>
            <div className="kpi-number">{kpis?.pendingAssignment ?? pendingShipments.length}</div>
            <div style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: '600', marginTop: '0.2rem' }}>
              Awaiting Route Matching
            </div>
          </div>
          <div className="kpi-icon-wrap kpi-icon-amber">
            <Clock size={26} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-meta">
            <h4>Completed Deliveries</h4>
            <div className="kpi-number">{kpis?.completedDeliveries ?? 0}</div>
            <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '600', marginTop: '0.2rem' }}>
              On-Time Rate: {kpis?.overallOnTimeRate || '98.5%'}
            </div>
          </div>
          <div className="kpi-icon-wrap kpi-icon-green">
            <CheckCircle2 size={26} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-meta">
            <h4>Delayed Shipments</h4>
            <div className="kpi-number" style={{ color: '#ef4444' }}>{kpis?.delayedShipments ?? 0}</div>
            <div style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: '600', marginTop: '0.2rem' }}>
              Traffic / Weather Reroutes
            </div>
          </div>
          <div className="kpi-icon-wrap kpi-icon-red">
            <AlertTriangle size={26} />
          </div>
        </div>
      </div>

      {/* Smart Dispatch Automation Banner */}
      <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', borderRadius: '16px', padding: '1.5rem', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', boxShadow: '0 8px 24px rgba(6, 78, 59, 0.2)' }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.18)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '700', color: '#a7f3d0', marginBottom: '0.6rem' }}>
            <Zap size={14} />
            <span>AI Automated Logistics Route & Proximity Dispatch</span>
          </div>
          <h3 style={{ fontSize: '1.35rem', color: '#ffffff', marginBottom: '0.35rem' }}>
            Smart Fleet Assignment Engine
          </h3>
          <p style={{ color: '#d1fae5', fontSize: '0.875rem', lineHeight: '1.4' }}>
            Instantly matches unassigned agricultural shipments to nearby available refrigerated vans or heavy trucks based on driver location proximity, vehicle capacity, and delivery deadlines.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn-primary" 
            style={{ background: '#10b981', color: '#064e3b', fontWeight: '800', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
            onClick={onRunAutoDispatch}
          >
            <Zap size={17} />
            <span>Run Auto-Dispatch ({pendingShipments.length} pending)</span>
          </button>

          <button 
            className="btn-secondary" 
            style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)' }}
            onClick={onOpenCreateShipment}
          >
            <PlusCircle size={17} />
            <span>Create Shipment</span>
          </button>
        </div>
      </div>

      {/* Active Pipeline Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Real-time En Route Deliveries */}
        <div className="data-table-container">
          <div className="table-header-bar">
            <div>
              <h4 style={{ fontSize: '1.05rem', color: '#064e3b' }}>Active Shipments En Route</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Live monitoring of temperature and transit</p>
            </div>
            <span style={{ fontSize: '0.8rem', background: '#ecfdf5', color: '#059669', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: '700' }}>
              {activeShipments.length} live
            </span>
          </div>

          <div style={{ padding: '1rem' }}>
            {activeShipments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No shipments currently en route.</div>
            ) : (
              activeShipments.map(s => (
                <div 
                  key={s.id || s._id} 
                  onClick={() => onSelectShipment(s)}
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <strong style={{ color: '#0f172a' }}>{s.productName} ({s.weightKg} kg)</strong>
                    <span className={`status-pill status-${s.status.toLowerCase().replace('-', '')}`}>
                      {s.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                    <MapPin size={13} color="#059669" />
                    <span>Destination: {s.destination}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    <span>Driver: <strong>{s.driverName || 'Priya Sharma'}</strong> ({s.vehicleNumber})</span>
                    <span style={{ color: '#059669', fontWeight: '700' }}>Track Live &rarr;</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available Fleet Drivers Proximity */}
        <div className="data-table-container">
          <div className="table-header-bar">
            <div>
              <h4 style={{ fontSize: '1.05rem', color: '#064e3b' }}>Fleet Proximity & Availability</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Ready for automated & manual dispatch</p>
            </div>
            <span style={{ fontSize: '0.8rem', background: '#f0fdf4', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: '700' }}>
              {drivers.length} vehicles
            </span>
          </div>

          <div style={{ padding: '1rem' }}>
            {safeDrivers.map(d => (
              <div key={d.id || d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '0.65rem', background: '#ffffff' }}>
                <div>
                  <strong style={{ color: '#0f172a', display: 'block' }}>{d.name}</strong>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {d.vehicleType} • Cap: {d.capacityKg} kg • {d.currentLocation}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '999px',
                    background: d.status === 'Available' ? '#ecfdf5' : '#fffbeb',
                    color: d.status === 'Available' ? '#047857' : '#b45309',
                    display: 'inline-block'
                  }}>
                    {d.status}
                  </span>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Rating: ⭐ {d.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
