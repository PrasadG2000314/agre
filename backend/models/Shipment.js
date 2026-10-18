const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  trackingNumber: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  productName: { type: String, required: true },
  category: { type: String, required: true },
  weightKg: { type: Number, required: true },
  pricePerKg: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  buyerName: { type: String, required: true },
  buyerPhone: { type: String },
  driverId: { type: String },
  driverName: { type: String },
  driverPhone: { type: String },
  vehicleNumber: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Dispatched', 'In-Transit', 'Delivered'], 
    default: 'Pending' 
  },
  isDelayed: { type: Boolean, default: false },
  delayReason: { type: String },
  otpCode: { type: String },
  estimatedDelivery: { type: Date },
  dispatchedAt: { type: Date },
  deliveredAt: { type: Date },
  proofOfDelivery: {
    verifiedOtp: String,
    recipientName: String,
    signatureData: String,
    photoUrl: String,
    timestamp: Date,
    confirmedBy: String
  },
  currentCoords: {
    lat: Number,
    lng: Number,
    locationName: String
  },
  routeTimeline: [
    {
      status: String,
      location: String,
      timestamp: { type: Date, default: Date.now },
      note: String
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Shipment || mongoose.model('Shipment', shipmentSchema);
