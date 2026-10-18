const express = require('express');
const router = express.Router();
const { getDeliveryReports } = require('../services/dataStore');

// Summary statistics and performance metrics
router.get('/summary', async (req, res) => {
  try {
    const reportData = await getDeliveryReports();
    res.json({ success: true, ...reportData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CSV Export for Logistics Auditing
router.get('/export-csv', async (req, res) => {
  try {
    const reportData = await getDeliveryReports();
    const rows = [
      ['Tracking Number', 'Order ID', 'Product', 'Category', 'Weight (kg)', 'Total Price ($)', 'Driver', 'Vehicle', 'Status', 'Delayed', 'Estimated Delivery', 'Delivered At']
    ];

    const all = [...reportData.completedList, ...reportData.delayedList];
    const unique = Array.from(new Map(all.map(item => [item.trackingNumber, item])).values());

    unique.forEach(s => {
      rows.push([
        s.trackingNumber,
        s.orderId,
        `"${s.productName}"`,
        s.category,
        s.weightKg,
        s.totalPrice.toFixed(2),
        s.driverName || 'Unassigned',
        s.vehicleNumber || 'N/A',
        s.status,
        s.isDelayed ? 'YES' : 'NO',
        s.estimatedDelivery ? s.estimatedDelivery.substring(0, 10) : 'N/A',
        s.deliveredAt ? s.deliveredAt.substring(0, 19).replace('T', ' ') : 'N/A'
      ]);
    });

    const csvContent = rows.map(r => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="agri_logistics_report.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
