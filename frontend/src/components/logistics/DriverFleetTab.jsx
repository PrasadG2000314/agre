import React, { useState } from 'react';
import { Truck, Plus, MapPin, Star, CheckCircle, Clock, ShieldCheck, X } from 'lucide-react';
import { api } from '../../services/api';

export default function DriverFleetTab({ drivers, onReloadDrivers }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Refrigerated Van');
  const [capacityKg, setCapacityKg] = useState(2000);
  const [currentLocation, setCurrentLocation] = useState('Greenfield Valley Sector 4');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createDriver({
        name,
        phone,
        vehicleNumber,
        vehicleType,
        capacityKg: Number(capacityKg),
        currentLocation
      });
      if (res.success) {
        setShowAddModal(false);
        setName('');
        setPhone('');
        setVehicleNumber('');
        onReloadDrivers();
      }
    } catch (err) {
      alert('Error registering driver: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (driver) => {
    const nextStatus = driver.status === 'Available' ? 'Off Duty' : 'Available';
    try {
      await api.updateDriver(driver.id || driver._id, { status: nextStatus });
      onReloadDrivers();
    } catch (err) {
      alert('Failed to update driver status');
    }
  };

  return (
    <div>
      <div className="data-table-container">
        <div className="table-header-bar">
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#064e3b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} />
              <span>Logistics Fleet & Driver Operations</span>
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Monitor vehicle capacities, cold-chain refrigeration units, real-time driver locations, and duty statuses.
            </p>
          </div>

          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Register Vehicle & Driver</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem', padding: '1.5rem' }}>
          {(Array.isArray(drivers) ? drivers : []).map(d => (
            <div 
              key={d.id || d._id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: '#0f172a' }}>{d.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '700' }}>
                    {d.vehicleNumber} • {d.vehicleType}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleStatus(d)}
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: d.status === 'Available' ? '#ecfdf5' : d.status === 'On Delivery' ? '#f0f9ff' : '#f1f5f9',
                    color: d.status === 'Available' ? '#047857' : d.status === 'On Delivery' ? '#0369a1' : '#64748b',
                    border: '1px solid currentColor'
                  }}
                  title="Click to toggle Available / Off Duty"
                >
                  {d.status}
                </button>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.825rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Cargo Capacity:</span>
                  <strong>{d.capacityKg} kg</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Phone:</span>
                  <strong>{d.phone}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Current Location:</span>
                  <span style={{ color: '#065f46', fontWeight: '600' }}>{d.currentLocation}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Star size={14} color="#f59e0b" fill="#f59e0b" />
                  <strong>{d.rating || 4.9}</strong>
                  <span style={{ color: '#64748b' }}>({d.completedDeliveries || 0} deliveries)</span>
                </div>
                <div style={{ color: '#059669', fontWeight: '700' }}>
                  {d.onTimeRate ? `${d.onTimeRate}% on-time` : '98.5% on-time'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Register Logistics Vehicle & Driver</h3>
              <button onClick={() => setShowAddModal(false)} style={{ color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDriver}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Driver Full Name:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Fernando Morales"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone:</label>
                  <input 
                    type="text" 
                    placeholder="+1 (555) 789-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label>Vehicle License Plate:</label>
                    <input 
                      type="text" 
                      placeholder="AGRI-TRK-771"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Vehicle Type:</label>
                    <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                      <option value="Refrigerated Van">Refrigerated Van</option>
                      <option value="Agri Heavy Truck">Agri Heavy Truck</option>
                      <option value="Tractor-Trailer">Tractor-Trailer</option>
                      <option value="Eco Cargo Pickup">Eco Cargo Pickup</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label>Cargo Capacity (kg):</label>
                    <input 
                      type="number" 
                      value={capacityKg}
                      onChange={(e) => setCapacityKg(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Assigned Proximity Hub:</label>
                    <input 
                      type="text" 
                      value={currentLocation}
                      onChange={(e) => setCurrentLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Add Vehicle to Fleet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
