import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Key, 
  ChevronRight, 
  X,
  Zap
} from 'lucide-react';
import { api } from '../../services/api';

const STATUS_FILTERS = ['All', 'Pending', 'Dispatched', 'In-Transit', 'Delivered'];

export default function ShipmentManagementTab({ 
  shipments, 
  drivers, 
  onReloadShipments, 
  onOpenTracking, 
  onOpenProofOfDelivery,
  onAutoDispatch 
}) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Shipment Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [prodName, setProdName] = useState('Crisp Vine-Ripened Tomatoes');
  const [category, setCategory] = useState('Fresh Vegetables');
  const [weightKg, setWeightKg] = useState(250);
  const [pricePerKg, setPricePerKg] = useState(2.80);
  const [origin, setOrigin] = useState('Evergreen Highland Farms, Gate 3');
  const [destination, setDestination] = useState('Metro Fresh Supermarket, Bay Street');
  const [buyerName, setBuyerName] = useState('Sarah Jenkins');
  const [buyerPhone, setBuyerPhone] = useState('+1 (555) 789-0123');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [creating, setCreating] = useState(false);

  // Assign Driver Modal State
  const [assignShipment, setAssignShipment] = useState(null);
  const [assignDriverId, setAssignDriverId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const safeShipments = Array.isArray(shipments) ? shipments : [];
  const safeDrivers = Array.isArray(drivers) ? drivers : [];

  const filteredShipments = safeShipments.filter(s => {
    if (!s) return false;
    const matchesStatus = statusFilter === 'All' || (s.status && s.status.toLowerCase() === statusFilter.toLowerCase());
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      s.trackingNumber.toLowerCase().includes(q) ||
      s.orderId.toLowerCase().includes(q) ||
      s.productName.toLowerCase().includes(q) ||
      s.buyerName.toLowerCase().includes(q) ||
      (s.driverName && s.driverName.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.createShipment({
        productName: prodName,
        category,
        weightKg: Number(weightKg),
        pricePerKg: Number(pricePerKg),
        origin,
        destination,
        buyerName,
        buyerPhone,
        driverId: selectedDriverId || null
      });

      if (res.success) {
        setShowCreateModal(false);
        onReloadShipments();
      }
    } catch (err) {
      alert('Error creating shipment: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleAssignDriver = async (e) => {
    e.preventDefault();
    if (!assignShipment || !assignDriverId) return;
    setAssigning(true);
    try {
      const res = await api.assignDriver(assignShipment.id, assignDriverId);
      if (res.success) {
        setAssignShipment(null);
        onReloadShipments();
      }
    } catch (err) {
      alert(err.message || 'Error assigning driver');
    } finally {
      setAssigning(false);
    }
  };

  const getStatusClass = (st) => {
    switch (st?.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'in-transit': return 'status-intransit';
      case 'dispatched': return 'status-dispatched';
      default: return 'status-pending';
    }
  };

  return (
    <div>
      <div className="data-table-container">
        {/* Table Top Header */}
        <div className="table-header-bar">
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#064e3b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={20} />
              <span>Agricultural Shipment Orders & Logistics Pipeline</span>
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Create, track real-time transit status, assign refrigerated fleet vehicles, and verify proof of delivery.
            </p>
          </div>

          <button 
            className="btn-primary" 
            onClick={() => setShowCreateModal(true)}
            id="btn-create-shipment"
          >
            <Plus size={16} />
            <span>Create New Shipment</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {STATUS_FILTERS.map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  background: statusFilter === st ? '#064e3b' : '#ffffff',
                  color: statusFilter === st ? '#ffffff' : '#475569',
                  border: '1px solid #cbd5e1'
                }}
              >
                {st === 'All' ? 'All Shipments' : st}
              </button>
            ))}
          </div>

          <div className="table-search-box">
            <Search size={16} className="table-search-icon" />
            <input 
              type="text" 
              placeholder="Search tracking #, order, produce, buyer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Shipments Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Tracking # / Order</th>
                <th>Produce & Cargo Weight</th>
                <th>Rate & Total Value</th>
                <th>Route (Origin &rarr; Destination)</th>
                <th>Assigned Driver & Vehicle</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No agricultural shipments found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredShipments.map(s => (
                  <tr key={s.id || s._id}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#065f46' }}>
                        {s.trackingNumber}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {s.orderId}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '700', marginTop: '0.15rem' }}>
                        OTP: {s.otpCode || '4829'}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{s.productName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {s.weightKg} kg • {s.category}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: '700', color: '#059669' }}>
                        ${s.totalPrice.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        ${s.pricePerKg.toFixed(2)} / 1 kg
                      </div>
                    </td>

                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ color: '#0f172a', fontWeight: '600' }}>To:</span> {s.destination}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Buyer: {s.buyerName}
                      </div>
                    </td>

                    <td>
                      {s.driverName ? (
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{s.driverName}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.vehicleNumber}</div>
                        </div>
                      ) : (
                        <button
                          className="btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: '#b45309', background: '#fef3c7', borderColor: '#fde68a' }}
                          onClick={() => {
                            setAssignShipment(s);
                            setAssignDriverId(drivers.find(d => d.status === 'Available')?.id || '');
                          }}
                        >
                          + Assign Driver
                        </button>
                      )}
                    </td>

                    <td>
                      <div>
                        <span className={`status-pill ${getStatusClass(s.status)}`}>
                          {s.status}
                        </span>
                        {s.isDelayed && (
                          <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '700', marginTop: '0.2rem' }}>
                            ⚠️ Delayed
                          </div>
                        )}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button 
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => onOpenTracking(s)}
                          title="View Live Transit Milestones"
                        >
                          Track
                        </button>

                        {s.status !== 'Delivered' && (
                          <button 
                            className="btn-primary"
                            style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem' }}
                            onClick={() => onOpenProofOfDelivery(s)}
                            title="Verify Proof of Delivery (OTP & Signature)"
                          >
                            PoD
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Shipment Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3>Create Agricultural Order Shipment</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateShipment}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Agricultural Produce / Food Product:</label>
                  <input 
                    type="text" 
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label>Category:</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Fresh Vegetables">Fresh Vegetables</option>
                      <option value="Organic Fruits">Organic Fruits</option>
                      <option value="Grains & Cereals">Grains & Cereals</option>
                      <option value="Tubers & Root Crops">Tubers & Root Crops</option>
                      <option value="Farm Herbs & Spices">Farm Herbs & Spices</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Weight (kg):</label>
                    <input 
                      type="number" 
                      min="1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Rate ($ / 1 kg):</label>
                    <input 
                      type="number" 
                      step="0.05"
                      value={pricePerKg}
                      onChange={(e) => setPricePerKg(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Origin Farm / Warehouse Gate:</label>
                  <input 
                    type="text" 
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Destination Address / Wholesale Terminal:</label>
                  <input 
                    type="text" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label>Buyer Name:</label>
                    <input 
                      type="text" 
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Buyer Phone (for OTP):</label>
                    <input 
                      type="text" 
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Initial Driver Assignment (Optional):</label>
                  <select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)}>
                    <option value="">-- Leave Unassigned (Pending Dispatch) --</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.vehicleType} - Cap: {d.capacityKg} kg) - {d.status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Dispatching...' : `Create Shipment ($${(Number(weightKg) * Number(pricePerKg)).toFixed(2)})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Driver Assignment Modal */}
      {assignShipment && (
        <div className="modal-backdrop" onClick={() => setAssignShipment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Assign Driver to {assignShipment.trackingNumber}</h3>
              <button onClick={() => setAssignShipment(null)} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignDriver}>
              <div className="modal-body">
                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                  <div><strong>Cargo:</strong> {assignShipment.productName} ({assignShipment.weightKg} kg)</div>
                  <div><strong>Route:</strong> {assignShipment.origin} &rarr; {assignShipment.destination}</div>
                </div>

                <div className="form-group">
                  <label>Select Available Fleet Vehicle / Driver:</label>
                  <select 
                    value={assignDriverId} 
                    onChange={(e) => setAssignDriverId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Driver --</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} • {d.vehicleType} ({d.vehicleNumber}) • Cap: {d.capacityKg} kg • [{d.status}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setAssignShipment(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={assigning}>
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
