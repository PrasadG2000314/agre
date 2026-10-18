import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Truck, 
  FileText, 
  Search, 
  RefreshCw,
  Plus,
  Zap,
  ArrowLeft,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { api } from '../services/api';
import OverviewTab from './logistics/OverviewTab';
import UserManagementTab from './logistics/UserManagementTab';
import ShipmentManagementTab from './logistics/ShipmentManagementTab';
import DriverFleetTab from './logistics/DriverFleetTab';
import ReportGeneratorTab from './logistics/ReportGeneratorTab';
import LiveTrackingModal from './logistics/LiveTrackingModal';
import ProofOfDeliveryModal from './logistics/ProofOfDeliveryModal';

export default function LogisticsDashboard({ user, onNavigateToStore, onOpenGlobalSearch }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'shipments' | 'fleet' | 'reports'
  const [users, setUsers] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dispatchAlert, setDispatchAlert] = useState(null);

  // Modals state
  const [activeTrackingShipment, setActiveTrackingShipment] = useState(null);
  const [activePoDShipment, setActivePoDShipment] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [uRes, sRes, dRes, rRes] = await Promise.all([
        api.getUsers(),
        api.getShipments(),
        api.getDrivers(),
        api.getReportsSummary()
      ]);

      if (uRes.success) setUsers(uRes.users);
      if (sRes.success) setShipments(sRes.shipments);
      if (dRes.success) setDrivers(dRes.drivers);
      if (rRes.success) setKpis(rRes.kpis);
    } catch (err) {
      console.error('Error fetching logistics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAutoDispatch = async () => {
    const pendingList = shipments.filter(s => s.status === 'Pending');
    if (pendingList.length === 0) {
      alert('All agricultural shipments are already dispatched! No pending loads in queue.');
      return;
    }

    let assignedCount = 0;
    for (const shp of pendingList) {
      try {
        const res = await api.autoDispatch(shp.id);
        if (res.success) assignedCount++;
      } catch (err) {
        console.warn('Dispatch match warning:', err.message);
      }
    }

    await loadAllData();
    setDispatchAlert(`⚡ Auto-Dispatch Completed: Successfully assigned optimal drivers and routes for ${assignedCount} pending shipment(s)!`);
    setTimeout(() => setDispatchAlert(null), 6000);
  };

  const handleAdvanceStatus = async (shipmentId, status, location, note) => {
    try {
      const res = await api.updateShipmentStatus(shipmentId, { status, location, note });
      if (res.success) {
        await loadAllData();
        if (activeTrackingShipment && (activeTrackingShipment.id === shipmentId)) {
          setActiveTrackingShipment(res.shipment);
        }
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handlePoDSuccess = async (updatedShipment) => {
    await loadAllData();
    setActiveTrackingShipment(updatedShipment);
  };

  return (
    <div className="logistics-portal-view">
      {/* Portal Top Bar */}
      <div className="portal-topbar">
        <div className="portal-title-block">
          <h2>
            <Truck size={24} color="#059669" />
            <span>User & Logistics Management Portal</span>
          </h2>
          <p>
            Central dispatch control, user permissions, cold-chain shipment tracking, and proof of delivery
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="portal-nav-tabs">
          <button 
            className={`portal-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={16} />
            <span>Overview</span>
          </button>

          <button 
            className={`portal-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} />
            <span>User & Roles ({users.length})</span>
          </button>

          <button 
            className={`portal-tab-btn ${activeTab === 'shipments' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipments')}
          >
            <Package size={16} />
            <span>Shipments & Transit ({shipments.length})</span>
          </button>

          <button 
            className={`portal-tab-btn ${activeTab === 'fleet' ? 'active' : ''}`}
            onClick={() => setActiveTab('fleet')}
          >
            <Truck size={16} />
            <span>Fleet & Proximity ({drivers.length})</span>
          </button>

          <button 
            className={`portal-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <FileText size={16} />
            <span>Report Generator</span>
          </button>
        </div>

        {/* Right side utilities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button 
            className="btn-secondary" 
            onClick={loadAllData} 
            title="Refresh All Real-Time Data"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={15} />
            <span>Sync</span>
          </button>

          <button 
            className="btn-primary" 
            onClick={onNavigateToStore}
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={15} />
            <span>Return to Store</span>
          </button>
        </div>
      </div>

      {/* Auto Dispatch Notification Banner */}
      {dispatchAlert && (
        <div style={{ background: '#ecfdf5', borderBottom: '1px solid #a7f3d0', padding: '0.75rem 1.5rem', color: '#065f46', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={18} color="#059669" />
          <span>{dispatchAlert}</span>
        </div>
      )}

      {/* Portal Main Body */}
      <div className="portal-body">
        {loading && shipments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              Syncing with Enterprise Logistics Database...
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewTab 
                kpis={kpis}
                shipments={shipments}
                drivers={drivers}
                onRunAutoDispatch={handleRunAutoDispatch}
                onOpenCreateShipment={() => setActiveTab('shipments')}
                onSelectShipment={(s) => setActiveTrackingShipment(s)}
              />
            )}

            {activeTab === 'users' && (
              <UserManagementTab 
                users={users} 
                onReloadUsers={loadAllData} 
              />
            )}

            {activeTab === 'shipments' && (
              <ShipmentManagementTab 
                shipments={shipments}
                drivers={drivers}
                onReloadShipments={loadAllData}
                onOpenTracking={(s) => setActiveTrackingShipment(s)}
                onOpenProofOfDelivery={(s) => setActivePoDShipment(s)}
                onAutoDispatch={handleRunAutoDispatch}
              />
            )}

            {activeTab === 'fleet' && (
              <DriverFleetTab 
                drivers={drivers} 
                onReloadDrivers={loadAllData} 
              />
            )}

            {activeTab === 'reports' && (
              <ReportGeneratorTab />
            )}
          </>
        )}
      </div>

      {/* Live Tracking Modal */}
      {activeTrackingShipment && (
        <LiveTrackingModal 
          shipment={activeTrackingShipment}
          onClose={() => setActiveTrackingShipment(null)}
          onAdvanceStatus={handleAdvanceStatus}
          onOpenProofOfDelivery={(s) => {
            setActiveTrackingShipment(null);
            setActivePoDShipment(s);
          }}
        />
      )}

      {/* Proof of Delivery Modal */}
      {activePoDShipment && (
        <ProofOfDeliveryModal 
          shipment={activePoDShipment}
          onClose={() => setActivePoDShipment(null)}
          onSuccess={handlePoDSuccess}
        />
      )}
    </div>
  );
}
