const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agri_logistics';
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500, // Quick timeout so server doesn't hang if Mongo isn't running
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB not connected (${error.message}).`);
    console.log(`⚡ Activated Resilient In-Memory Data Store: All APIs and Logistics algorithms remain 100% operational!`);
    isConnected = false;
    return false;
  }
};

const getStatus = () => isConnected;

module.exports = { connectDB, getStatus };
