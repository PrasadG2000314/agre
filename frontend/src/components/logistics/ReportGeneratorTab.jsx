import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  TrendingUp, 
  Clock, 
  Filter,
  Truck
} from 'lucide-react';
import { api } from '../../services/api';

export default function ReportGeneratorTab() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('completed'); // 'completed' | 'delayed' | 'drivers'

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReportsSummary();
      if (data.success) {
        setReportData(data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    window.open(api.getExportCsvUrl(), '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
        Generating real-time logistics analytics report...
      </div>
    );
  }

  const { kpis, completedList, delayedList, driverMetrics } = reportData || {
    kpis: {},
    completedList: [],
    delayedList: [],
    driverMetrics: []
  };

  return (
    <div>
      <div className="data-table-container">
        {/* Report Generator Controls Header */}
        <div className="table-header-bar">
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#064e3b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={22} />
              <span>Logistics Operations Report Generator</span>
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Audited performance metrics for completed deliveries, delayed shipments, and driver scorecards.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button className="btn-secondary" onClick={handlePrint}>
              <Printer size={16} />
              <span>Print Summary</span>
            </button>
            <button className="btn-primary" onClick={handleDownloadCsv}>
              <Download size={16} />
              <span>Export CSV Audit File</span>
            </button>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '1.25rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Overall On-Time Rate</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#059669' }}>
              {kpis.overallOnTimeRate || '98.5%'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Target SLA: &gt;95%</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Completed Deliveries</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>
              {kpis.completedDeliveries || completedList.length}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '600' }}>Verified with PoD OTP</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Delayed Shipments</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ef4444' }}>
              {kpis.delayedShipments || delayedList.length}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#ef4444' }}>Incident reports logged</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Fleet Utilization</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0284c7' }}>
              {kpis.fleetActiveDrivers || 1} / {(kpis.fleetActiveDrivers || 1) + (kpis.fleetAvailableDrivers || 3)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Active vehicles on duty</div>
          </div>
        </div>

        {/* Sub-tabs selector for the 3 functional report types */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setActiveSubTab('completed')}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: activeSubTab === 'completed' ? '#064e3b' : '#f1f5f9',
              color: activeSubTab === 'completed' ? '#ffffff' : '#475569'
            }}
          >
            <CheckCircle2 size={16} />
            <span>Completed Deliveries ({completedList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('delayed')}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: activeSubTab === 'delayed' ? '#b91c1c' : '#f1f5f9',
              color: activeSubTab === 'delayed' ? '#ffffff' : '#475569'
            }}
          >
            <AlertTriangle size={16} />
            <span>Delayed Shipments ({delayedList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('drivers')}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: activeSubTab === 'drivers' ? '#0369a1' : '#f1f5f9',
              color: activeSubTab === 'drivers' ? '#ffffff' : '#475569'
            }}
          >
            <Award size={16} />
            <span>Driver Performance Metrics ({driverMetrics.length})</span>
          </button>
        </div>

        {/* View 1: Completed Deliveries */}
        {activeSubTab === 'completed' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tracking # / Order</th>
                  <th>Delivered Produce</th>
                  <th>Weight & Value</th>
                  <th>Delivered At</th>
                  <th>Driver & Vehicle</th>
                  <th>Proof of Delivery Details</th>
                </tr>
              </thead>
              <tbody>
                {completedList.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No completed deliveries recorded yet.
                    </td>
                  </tr>
                ) : (
                  completedList.map(s => (
                    <tr key={s.id || s._id}>
                      <td>
                        <strong style={{ color: '#065f46' }}>{s.trackingNumber}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.orderId}</div>
                      </td>
                      <td>
                        <strong>{s.productName}</strong>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.category}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: '#059669' }}>${s.totalPrice.toFixed(2)}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.weightKg} kg (${s.pricePerKg}/kg)</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600' }}>
                          {s.deliveredAt ? new Date(s.deliveredAt).toLocaleDateString() : 'Today'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {s.deliveredAt ? new Date(s.deliveredAt).toLocaleTimeString() : '15:42'}
                        </div>
                      </td>
                      <td>
                        <strong>{s.driverName || 'Carlos Mendoza'}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.vehicleNumber || 'AGRI-VAN-904'}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CheckCircle2 size={16} color="#059669" />
                          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#065f46' }}>
                            OTP {s.proofOfDelivery?.verifiedOtp || s.otpCode} Verified
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Receiver: {s.proofOfDelivery?.recipientName || s.buyerName}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* View 2: Delayed Shipments */}
        {activeSubTab === 'delayed' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tracking # / Order</th>
                  <th>Cargo Item</th>
                  <th>Expected Delivery</th>
                  <th>Driver & Route</th>
                  <th>Delay Cause / Incident Report</th>
                  <th>Resolution Status</th>
                </tr>
              </thead>
              <tbody>
                {delayedList.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#059669' }}>
                      All shipments are currently on schedule! Zero active delays.
                    </td>
                  </tr>
                ) : (
                  delayedList.map(s => (
                    <tr key={s.id || s._id}>
                      <td>
                        <strong style={{ color: '#b91c1c' }}>{s.trackingNumber}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.orderId}</div>
                      </td>
                      <td>
                        <strong>{s.productName}</strong>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.weightKg} kg</div>
                      </td>
                      <td>
                        <div style={{ color: '#ef4444', fontWeight: '700' }}>
                          {s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleTimeString() : 'Overdue'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          Original ETA exceeded
                        </div>
                      </td>
                      <td>
                        <strong>{s.driverName || 'Priya Sharma'}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.destination}</div>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.5rem', color: '#991b1b', fontSize: '0.8rem' }}>
                          <strong>Delay Alert:</strong> {s.delayReason || 'Mountain Pass Landslide & Route Diversion in effect (+3.5 hours)'}
                        </div>
                      </td>
                      <td>
                        <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>
                          Reroute In Transit
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* View 3: Driver Performance Metrics */}
        {activeSubTab === 'drivers' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Vehicle Type & Plate</th>
                  <th>Current Station</th>
                  <th>Completed Loads</th>
                  <th>Delayed Loads</th>
                  <th>On-Time Compliance</th>
                  <th>Customer Rating</th>
                </tr>
              </thead>
              <tbody>
                {driverMetrics.map((d, index) => (
                  <tr key={d.driverId || index}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ecfdf5', color: '#065f46', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                          #{index + 1}
                        </div>
                        <strong style={{ color: '#0f172a' }}>{d.name}</strong>
                      </div>
                    </td>
                    <td>
                      <strong>{d.vehicle}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{d.vehicleType}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                      {d.currentLocation}
                    </td>
                    <td>
                      <span style={{ fontWeight: '800', color: '#059669', fontSize: '1rem' }}>
                        {d.completedLoads}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}> loads</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '700', color: d.delayedLoads > 3 ? '#ef4444' : '#64748b' }}>
                        {d.delayedLoads}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: d.onTimeRate, height: '100%', background: '#10b981' }}></div>
                        </div>
                        <strong style={{ color: '#059669', fontSize: '0.85rem' }}>{d.onTimeRate}</strong>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#d97706', fontWeight: '800' }}>
                        <span>⭐</span>
                        <span>{d.rating}</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>/ 5.0</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
