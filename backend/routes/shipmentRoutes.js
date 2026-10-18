const express = require('express');
const router = express.Router();
const {
  getShipments,
  getShipmentByTracking,
  createShipment,
  assignDriverToShipment,
  autoAssignOptimalDriver,
  updateShipmentStatus,
  confirmProofOfDelivery
} = require('../services/dataStore');

// List shipments with optional filters (status, isDelayed, search)
router.get('/', async (req, res) => {
  try {
    const { status, isDelayed, search } = req.query;
    const shipments = await getShipments({ status, isDelayed, search });
    res.json({ success: true, count: shipments.length, shipments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Real-time tracking lookup by tracking number
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const shipment = await getShipmentByTracking(trackingNumber);
    if (!shipment) {
      return res.status(404).json({ success: false, message: `Shipment with tracking # ${trackingNumber} not found` });
    }
    res.json({ success: true, shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create new shipment for an agricultural order
router.post('/', async (req, res) => {
  try {
    const { productName, category, weightKg, pricePerKg, origin, destination, buyerName, buyerPhone, driverId } = req.body;
    if (!productName || !destination || !buyerName) {
      return res.status(400).json({ success: false, message: 'Product name, destination and buyer name are required' });
    }

    const shipment = await createShipment(req.body);
    res.status(201).json({ success: true, message: 'Agricultural shipment created successfully', shipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Manual driver assignment based on location/fleet availability
router.post('/:id/assign-driver', async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;
    if (!driverId) {
      return res.status(400).json({ success: false, message: 'Driver ID is required for assignment' });
    }

    const result = await assignDriverToShipment(id, driverId);
    res.json({
      success: true,
      message: `Driver ${result.driver.name} successfully assigned to shipment`,
      shipment: result.shipment,
      driver: result.driver
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Intelligent Auto-Assignment (Location Proximity & Capacity Algorithm)
router.post('/:id/auto-dispatch', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await autoAssignOptimalDriver(id);
    res.json({
      success: true,
      message: `Optimal driver ${result.driver.name} assigned automatically via location and cargo capacity matching`,
      shipment: result.shipment,
      driver: result.driver
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Update shipment status (Pending -> Dispatched -> In-Transit -> Delivered)
router.post('/:id/update-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location, note, isDelayed, delayReason } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const updated = await updateShipmentStatus(id, { status, location, note, isDelayed, delayReason });
    res.json({ success: true, message: `Shipment status updated to ${status}`, shipment: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Proof of Delivery Confirmation (OTP verification, digital signature, photo)
router.post('/:id/proof-of-delivery', async (req, res) => {
  try {
    const { id } = req.params;
    const { otp, recipientName, signatureData, photoUrl, confirmedBy } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: 'Delivery OTP verification code is required' });
    }

    const updated = await confirmProofOfDelivery(id, { otp, recipientName, signatureData, photoUrl, confirmedBy });
    res.json({
      success: true,
      message: 'Proof of Delivery verified and recorded successfully! Shipment marked as Delivered.',
      shipment: updated
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
