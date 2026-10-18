const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, getStatus } = require('./config/db');
const { syncWithMongoDB } = require('./services/dataStore');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Route handlers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/drivers', require('./routes/driverRoutes'));
app.use('/api/shipments', require('./routes/shipmentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'AgriLogistics Multi-Role Platform API',
    mongoDBConnected: getStatus(),
    mode: getStatus() ? 'MongoDB Production' : 'Resilient In-Memory State',
    timestamp: new Date().toISOString()
  });
});

// Root API description
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Agri Logistics & User Management API Service',
    documentation: '/api/health',
    endpoints: [
      '/api/products (1-Page Agri Store Produce & 1kg Prices)',
      '/api/auth (Login, Register, Role Authentication)',
      '/api/users (User Management & Roles: Admin, Buyer, Seller, Driver)',
      '/api/shipments (Shipment lifecycle, Auto-dispatch, Live Tracking, Proof of Delivery)',
      '/api/drivers (Fleet & Drivers Management)',
      '/api/reports (Report Generator: Completed, Delayed, Driver Performance, CSV Export)',
      '/api/search (Multi-entity Search Bar across Users, Drivers, Orders, Shipments)'
    ]
  });
});

// Start Server
const startServer = async () => {
  const connected = await connectDB();
  if (connected) {
    await syncWithMongoDB();
  }

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🌾 Agri Logistics & User Management Engine Active!`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 MongoDB Status: ${getStatus() ? 'CONNECTED' : 'IN-MEMORY RESILIENT MODE'}`);
    console.log(`=======================================================`);
  });
};

startServer();
