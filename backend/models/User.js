const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Buyer', 'Seller', 'Driver'], 
    default: 'Buyer' 
  },
  phone: { type: String },
  location: { type: String },
  status: { 
    type: String, 
    enum: ['Active', 'Suspended', 'Pending Verification'], 
    default: 'Active' 
  },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
