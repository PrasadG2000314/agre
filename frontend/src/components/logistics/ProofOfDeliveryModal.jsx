import React, { useState, useRef, useEffect } from 'react';
import { X, CheckCircle, PenTool, Key, Camera, User, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

export default function ProofOfDeliveryModal({ shipment, onClose, onSuccess }) {
  const [otp, setOtp] = useState('');
  const [recipientName, setRecipientName] = useState(shipment?.buyerName || '');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Canvas Signature State
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#065f46';
  }, []);

  if (!shipment) return null;

  const startDrawing = (e) => {
    setIsDrawing(true);
    setHasSigned(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSubmitPoD = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the delivery OTP code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let signatureData = null;
      if (hasSigned && canvasRef.current) {
        signatureData = canvasRef.current.toDataURL('image/png');
      }

      const res = await api.confirmProofOfDelivery(shipment.id, {
        otp: otp.trim(),
        recipientName: recipientName.trim(),
        signatureData,
        photoUrl,
        confirmedBy: shipment.driverName || 'Carlos Mendoza'
      });

      if (res.success) {
        onSuccess(res.shipment);
        onClose();
      } else {
        setError(res.message || 'Verification failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify proof of delivery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div>
            <h3>Proof of Delivery (PoD) Confirmation</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Verify OTP, capture digital signature and confirm cargo receipt
            </p>
          </div>
          <button onClick={onClose} style={{ color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmitPoD}>
          <div className="modal-body">
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Shipment Context Box */}
            <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#064e3b' }}>
                  {shipment.productName} ({shipment.weightKg} kg)
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Tracking #{shipment.trackingNumber} • Driver: {shipment.driverName || 'Carlos Mendoza'}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Expected OTP:</div>
                <button
                  type="button"
                  onClick={() => setOtp(shipment.otpCode || '4829')}
                  style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800' }}
                  title="Click to auto-fill OTP"
                >
                  {shipment.otpCode || '4829'} (Click fill)
                </button>
              </div>
            </div>

            {/* 1. OTP Verification Input */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Key size={16} color="#059669" />
                <span>1. Enter Recipient Delivery OTP Code:</span>
              </label>
              <input 
                type="text"
                maxLength="6"
                placeholder="Enter 4-digit OTP provided to buyer"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ fontSize: '1.2rem', letterSpacing: '4px', textAlign: 'center', fontWeight: '700', borderColor: '#10b981' }}
                required
              />
            </div>

            {/* 2. Recipient Name */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={16} color="#059669" />
                <span>2. Recipient / Receiver Authorized Name:</span>
              </label>
              <input 
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Full name of receiver"
                required
              />
            </div>

            {/* 3. Interactive Digital Signature Pad */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', margin: 0 }}>
                  <PenTool size={16} color="#059669" />
                  <span>3. Digital Signature (Touch / Mouse):</span>
                </label>
                <button 
                  type="button" 
                  onClick={clearSignature}
                  style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600' }}
                >
                  Clear Pad
                </button>
              </div>

              <canvas
                ref={canvasRef}
                width={480}
                height={120}
                className="signature-canvas"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.2rem' }}>
                Sign inside the box above to generate proof of delivery signature
              </div>
            </div>

            {/* 4. Delivery Photo Preview */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Camera size={16} color="#059669" />
                <span>4. Delivery Confirmation Photo:</span>
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <img 
                  src={photoUrl} 
                  alt="Delivery Proof" 
                  style={{ width: '80px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                />
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Cold-chain sealed agricultural produce package confirmed at destination terminal bay.
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <CheckCircle size={16} />
              <span>{loading ? 'Verifying...' : 'Verify OTP & Confirm Delivery'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
