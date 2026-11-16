const express = require('express');
const router = express.Router();
const { getDrivers, createDriver, updateDriver } = require('../services/dataStore');
const { requireAdmin } = require('../middleware/auth');

// List drivers
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    const drivers = await getDrivers({ status, search });
    res.json({ success: true, count: drivers.length, drivers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Register new driver / logistics partner (Admin Only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, vehicleNumber, vehicleType, capacityKg, currentLocation } = req.body;
    if (!name || !phone || !vehicleNumber) {
      return res.status(400).json({ success: false, message: 'Name, phone and vehicle number are required' });
    }

    const driver = await createDriver({
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@agrilog.com`,
      phone,
      vehicleNumber,
      vehicleType: vehicleType || 'Refrigerated Van',
      capacityKg: Number(capacityKg) || 2000,
      currentLocation: currentLocation || 'Central Hub',
      status: 'Available'
    });

    res.status(201).json({ success: true, message: 'Driver registered successfully', driver });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update driver status or location (Admin Only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateDriver(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.json({ success: true, message: 'Driver details updated', driver: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
