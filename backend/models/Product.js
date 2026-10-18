const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Fresh Vegetables', 'Organic Fruits', 'Grains & Cereals', 'Tubers & Root Crops', 'Farm Herbs & Spices'],
    required: true 
  },
  pricePerKg: { type: Number, required: true },
  currency: { type: String, default: '$' },
  unit: { type: String, default: '1 kg' },
  image: { type: String, required: true },
  stockKg: { type: Number, default: 100 },
  origin: { type: String, default: 'Local Organic Farm' },
  organic: { type: Boolean, default: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
