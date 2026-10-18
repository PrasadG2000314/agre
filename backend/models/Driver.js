const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  vehicleType: { 
    type: String, 
    enum: ['Refrigerated Van', 'Agri Heavy Truck', 'Tractor-Trailer', 'Eco Cargo Pickup'],
    default: 'Refrigerated Van' 
  },
  capacityKg: { type: Number, required: true },
  currentLocation: { type: String, default: 'Central Agri Hub' },
  status: { 
    type: String, 
    enum: ['Available', 'On Delivery', 'Off Duty'], 
    default: 'Available' 
  },
  rating: { type: Number, default: 4.8 },
  completedDeliveries: { type: Number, default: 0 },
  delayedDeliveries: { type: Number, default: 0 },
  onTimeRate: { type: Number, default: 98.0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Driver || mongoose.model('Driver', driverSchema);
