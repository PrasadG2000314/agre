const express = require('express');
const router = express.Router();
const { globalSearch } = require('../services/dataStore');

// Global Multi-entity search across Users, Drivers, Orders/Shipments, Products
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        query: '',
        results: { users: [], drivers: [], shipments: [], products: [] }
      });
    }

    const results = await globalSearch(q);
    res.json({
      success: true,
      query: q,
      totalMatches: results.users.length + results.drivers.length + results.shipments.length + results.products.length,
      results
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
