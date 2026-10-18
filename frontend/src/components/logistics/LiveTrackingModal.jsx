import React from 'react';
import { X, Truck, MapPin, CheckCircle, Clock, ShieldCheck, Thermometer, User, Phone, AlertTriangle } from 'lucide-react';

export default function LiveTrackingModal({ shipment, onClose, onAdvanceStatus, onOpenProofOfDelivery }) {
  if (!shipment) return null;

  const getStatusClass = (st) => {
    switch (st?.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'in-transit': return 'status-intransit';
      case 'dispatched': return 'status-dispatched';
      default: return 'status-pending';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h3>Live Shipment Tracking</h3>
              <span className={`status-pill ${getStatusClass(shipment.status)}`}>
                {shipment.status}
              </span>
            </div>
            <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.15rem' }}>
              Tracking #{shipment.trackingNumber} • Order #{shipment.orderId}
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Delayed alert banner if delayed */}
          {shipment.isDelayed && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem', color: '#991b1b', display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>Shipment Delayed En Route</strong>
                <span style={{ fontSize: '0.825rem' }}>
                  {shipment.delayReason || 'Inclement road conditions or route bypass in progress.'}
                </span>
              </div>
            </div>
          )}

          {/* Cargo & Destination Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Agricultural Cargo</div>
              <div style={{ fontWeight: '700', fontSize: '0.925rem', color: '#0f172a' }}>{shipment.productName}</div>
              <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '600' }}>{shipment.weightKg} kg ({shipment.category})</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Assigned Driver & Vehicle</div>
              <div style={{ fontWeight: '700', fontSize: '0.925rem', color: '#0f172a' }}>
                {shipment.driverName || 'Awaiting Driver'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {shipment.vehicleNumber ? `${shipment.vehicleNumber}` : 'Pending assignment'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Estimated Delivery</div>
              <div style={{ fontWeight: '700', fontSize: '0.925rem', color: '#0f172a' }}>
                {shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Pending'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700' }}>
                OTP Code: {shipment.otpCode || '4829'}
              </div>
            </div>
          </div>

          {/* Interactive Route Timeline */}
          <h4 style={{ fontSize: '0.95rem', color: '#064e3b', marginBottom: '0.75rem' }}>
            Real-Time Delivery Lifecycle & Waypoints
          </h4>

          <div className="timeline-stepper">
            {shipment.routeTimeline && shipment.routeTimeline.map((item, idx) => (
              <div key={idx} className="timeline-item">
                <div className={`timeline-dot ${idx === shipment.routeTimeline.length - 1 ? 'active' : ''}`}></div>
                <div className="timeline-title">{item.status}</div>
                <div className="timeline-meta">
                  <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {item.location} • {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recent'}
                </div>
                {item.note && <div className="timeline-note">{item.note}</div>}
              </div>
            ))}
          </div>

          {/* If already delivered, show Proof of Delivery info */}
          {shipment.status === 'Delivered' && shipment.proofOfDelivery && (
            <div style={{ marginTop: '1.5rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: '700', marginBottom: '0.5rem' }}>
                <CheckCircle size={18} />
                <span>Verified Proof of Delivery Confirmation</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div>Verified OTP: <strong>{shipment.proofOfDelivery.verifiedOtp}</strong></div>
                <div>Recipient: <strong>{shipment.proofOfDelivery.recipientName}</strong></div>
                <div>Confirmed By: <strong>{shipment.proofOfDelivery.confirmedBy}</strong></div>
                <div>Timestamp: <strong>{new Date(shipment.proofOfDelivery.timestamp).toLocaleTimeString()}</strong></div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div>
            {shipment.status !== 'Delivered' && (
              <button 
                type="button" 
                className="btn-primary" 
                style={{ background: '#0284c7' }}
                onClick={() => onOpenProofOfDelivery(shipment)}
              >
                <CheckCircle size={16} />
                <span>Verify Proof of Delivery (PoD)</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {shipment.status === 'Pending' && (
              <button 
                className="btn-primary"
                onClick={() => onAdvanceStatus(shipment.id, 'Dispatched', 'Central Farm Hub Gate 1', 'Driver departed with cargo')}
              >
                Mark Dispatched
              </button>
            )}
            {shipment.status === 'Dispatched' && (
              <button 
                className="btn-primary"
                onClick={() => onAdvanceStatus(shipment.id, 'In-Transit', 'Highway 101 Northbound', 'En route to destination')}
              >
                Mark In-Transit
              </button>
            )}
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
