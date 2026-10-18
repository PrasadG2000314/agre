const express = require('express');
const router = express.Router();
const { getProducts, createShipment } = require('../services/dataStore');

// List agricultural food products with optional category filter
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const products = await getProducts(category);
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Quick Order from the 1-page Agri Store (Creates a logistics shipment)
router.post('/order', async (req, res) => {
  try {
    const { productId, productName, category, quantityKg, pricePerKg, buyerName, buyerPhone, destination } = req.body;
    if (!productName || !quantityKg || !buyerName || !destination) {
      return res.status(400).json({ success: false, message: 'Please provide product name, quantity in kg, your name and delivery address' });
    }

    const weightKg = Number(quantityKg);
    const price = Number(pricePerKg) || 3.00;

    const shipment = await createShipment({
      productName,
      category: category || 'Fresh Produce',
      weightKg,
      pricePerKg: price,
      origin: 'Green Harvest Farm Hub - Warehouse Gate 1',
      destination,
      buyerName,
      buyerPhone: buyerPhone || '+1 (555) 300-8899',
    });

    res.status(201).json({
      success: true,
      message: `Order placed successfully for ${weightKg} kg of ${productName}! Shipment dispatched into logistics pipeline.`,
      shipment
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
