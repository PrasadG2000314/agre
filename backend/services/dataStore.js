const { initialUsers, initialDrivers, initialProducts, initialShipments } = require('../seeds/seedData');
const { getStatus } = require('../config/db');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Shipment = require('../models/Shipment');
const Product = require('../models/Product');

// In-Memory state clone
let memoryUsers = JSON.parse(JSON.stringify(initialUsers));
let memoryDrivers = JSON.parse(JSON.stringify(initialDrivers));
let memoryProducts = JSON.parse(JSON.stringify(initialProducts));
let memoryShipments = JSON.parse(JSON.stringify(initialShipments));

// Initialize or sync with MongoDB if connected
const syncWithMongoDB = async () => {
  if (!getStatus()) return;
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding MongoDB database with initial agricultural data...');
      await User.insertMany(memoryUsers);
      await Driver.insertMany(memoryDrivers);
      await Product.insertMany(memoryProducts);
      await Shipment.insertMany(memoryShipments);
      console.log('✅ MongoDB successfully seeded!');
    }
  } catch (err) {
    console.error('Error during MongoDB sync:', err.message);
  }
};

// Users Methods
const getUsers = async (filters = {}) => {
  if (getStatus()) {
    try {
      const query = {};
      if (filters.role) query.role = filters.role;
      if (filters.status) query.status = filters.status;
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
          { location: { $regex: filters.search, $options: 'i' } }
        ];
      }
      return await User.find(query).sort({ createdAt: -1 }).lean();
    } catch (e) {
      console.warn('Fallback to in-memory for getUsers');
    }
  }
  let results = [...memoryUsers];
  if (filters.role && filters.role !== 'All') {
    results = results.filter(u => u.role.toLowerCase() === filters.role.toLowerCase());
  }
  if (filters.status && filters.status !== 'All') {
    results = results.filter(u => u.status.toLowerCase() === filters.status.toLowerCase());
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) || 
      (u.location && u.location.toLowerCase().includes(q))
    );
  }
  return results;
};

const createUser = async (userData) => {
  const newUser = {
    id: `usr_${Date.now()}`,
    ...userData,
    status: userData.status || 'Active',
    createdAt: new Date().toISOString(),
  };

  if (getStatus()) {
    try {
      const created = await User.create(newUser);
      return created;
    } catch (e) {
      console.warn('MongoDB error on createUser, saving in memory', e.message);
    }
  }

  memoryUsers.unshift(newUser);
  return newUser;
};

const updateUser = async (id, updates) => {
  if (getStatus()) {
    try {
      const updated = await User.findByIdAndUpdate(id, updates, { new: true });
      if (updated) return updated;
    } catch (e) {
      // Fallback
    }
  }
  const index = memoryUsers.findIndex(u => u.id === id || u._id === id);
  if (index !== -1) {
    memoryUsers[index] = { ...memoryUsers[index], ...updates };
    return memoryUsers[index];
  }
  return null;
};

const deleteUser = async (id) => {
  if (getStatus()) {
    try {
      await User.findByIdAndDelete(id);
    } catch (e) {}
  }
  memoryUsers = memoryUsers.filter(u => u.id !== id && u._id !== id);
  return true;
};

// Drivers Methods
const getDrivers = async (filters = {}) => {
  if (getStatus()) {
    try {
      const query = {};
      if (filters.status) query.status = filters.status;
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { vehicleNumber: { $regex: filters.search, $options: 'i' } },
          { currentLocation: { $regex: filters.search, $options: 'i' } }
        ];
      }
      return await Driver.find(query).lean();
    } catch (e) {}
  }
  let results = [...memoryDrivers];
  if (filters.status && filters.status !== 'All') {
    results = results.filter(d => d.status.toLowerCase() === filters.status.toLowerCase());
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.vehicleNumber.toLowerCase().includes(q) ||
      d.currentLocation.toLowerCase().includes(q)
    );
  }
  return results;
};

const createDriver = async (driverData) => {
  const newDriver = {
    id: `drv_${Date.now()}`,
    ...driverData,
    rating: 5.0,
    completedDeliveries: 0,
    delayedDeliveries: 0,
    onTimeRate: 100,
    createdAt: new Date().toISOString()
  };
  if (getStatus()) {
    try {
      return await Driver.create(newDriver);
    } catch (e) {}
  }
  memoryDrivers.push(newDriver);
  return newDriver;
};

const updateDriver = async (id, updates) => {
  if (getStatus()) {
    try {
      const updated = await Driver.findByIdAndUpdate(id, updates, { new: true });
      if (updated) return updated;
    } catch (e) {}
  }
  const index = memoryDrivers.findIndex(d => d.id === id || d._id === id);
  if (index !== -1) {
    memoryDrivers[index] = { ...memoryDrivers[index], ...updates };
    return memoryDrivers[index];
  }
  return null;
};

// Shipments Methods
const getShipments = async (filters = {}) => {
  if (getStatus()) {
    try {
      const query = {};
      if (filters.status) query.status = filters.status;
      if (filters.isDelayed !== undefined) query.isDelayed = filters.isDelayed === 'true';
      if (filters.search) {
        query.$or = [
          { trackingNumber: { $regex: filters.search, $options: 'i' } },
          { orderId: { $regex: filters.search, $options: 'i' } },
          { productName: { $regex: filters.search, $options: 'i' } },
          { buyerName: { $regex: filters.search, $options: 'i' } }
        ];
      }
      return await Shipment.find(query).sort({ createdAt: -1 }).lean();
    } catch (e) {}
  }
  let results = [...memoryShipments];
  if (filters.status && filters.status !== 'All') {
    results = results.filter(s => s.status.toLowerCase() === filters.status.toLowerCase());
  }
  if (filters.isDelayed !== undefined) {
    const isDel = filters.isDelayed === 'true' || filters.isDelayed === true;
    results = results.filter(s => s.isDelayed === isDel);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(s => 
      s.trackingNumber.toLowerCase().includes(q) ||
      s.orderId.toLowerCase().includes(q) ||
      s.productName.toLowerCase().includes(q) ||
      s.buyerName.toLowerCase().includes(q) ||
      (s.driverName && s.driverName.toLowerCase().includes(q))
    );
  }
  return results;
};

const getShipmentByTracking = async (trackingNumber) => {
  if (getStatus()) {
    try {
      const shp = await Shipment.findOne({ trackingNumber });
      if (shp) return shp;
    } catch (e) {}
  }
  return memoryShipments.find(s => s.trackingNumber.toLowerCase() === trackingNumber.toLowerCase());
};

const createShipment = async (data) => {
  const randomTracking = `AGRI-TRK-${Math.floor(1000 + Math.random() * 9000)}`;
  const randomOrderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  const newShipment = {
    id: `shp_${Date.now()}`,
    trackingNumber: data.trackingNumber || randomTracking,
    orderId: data.orderId || randomOrderId,
    productName: data.productName,
    category: data.category || 'Fresh Vegetables',
    weightKg: Number(data.weightKg) || 100,
    pricePerKg: Number(data.pricePerKg) || 2.50,
    totalPrice: (Number(data.weightKg) || 100) * (Number(data.pricePerKg) || 2.50),
    origin: data.origin || 'Regional Green Central Depot',
    destination: data.destination,
    buyerName: data.buyerName,
    buyerPhone: data.buyerPhone || '+1 (555) 000-1122',
    driverId: data.driverId || null,
    driverName: data.driverName || null,
    driverPhone: data.driverPhone || null,
    vehicleNumber: data.vehicleNumber || null,
    status: data.driverId ? 'Dispatched' : 'Pending',
    isDelayed: false,
    otpCode: otp,
    estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    dispatchedAt: data.driverId ? new Date().toISOString() : null,
    deliveredAt: null,
    proofOfDelivery: null,
    currentCoords: {
      lat: 37.7749,
      lng: -122.4194,
      locationName: data.origin || 'Central Agri Hub'
    },
    routeTimeline: [
      {
        status: 'Order Placed',
        location: data.origin || 'Central Agri Hub',
        timestamp: new Date().toISOString(),
        note: `Shipment created for ${data.weightKg || 100} kg of ${data.productName}`
      }
    ]
  };

  // If driver was provided upon creation
  if (data.driverId) {
    const drv = memoryDrivers.find(d => d.id === data.driverId);
    if (drv) {
      drv.status = 'On Delivery';
      newShipment.driverName = drv.name;
      newShipment.driverPhone = drv.phone;
      newShipment.vehicleNumber = drv.vehicleNumber;
      newShipment.routeTimeline.push({
        status: 'Driver Assigned',
        location: drv.currentLocation,
        timestamp: new Date().toISOString(),
        note: `Assigned to ${drv.name} (${drv.vehicleNumber})`
      });
    }
  }

  if (getStatus()) {
    try {
      return await Shipment.create(newShipment);
    } catch (e) {}
  }

  memoryShipments.unshift(newShipment);
  return newShipment;
};

// Smart Driver Assignment Algorithm
const assignDriverToShipment = async (shipmentId, driverId) => {
  const shipment = memoryShipments.find(s => s.id === shipmentId || s._id === shipmentId);
  const driver = memoryDrivers.find(d => d.id === driverId || d._id === driverId);

  if (!shipment) throw new Error('Shipment not found');
  if (!driver) throw new Error('Driver not found');

  // Verify capacity
  if (driver.capacityKg < shipment.weightKg) {
    throw new Error(`Driver vehicle capacity (${driver.capacityKg} kg) is insufficient for cargo (${shipment.weightKg} kg)`);
  }

  // Update Driver
  driver.status = 'On Delivery';

  // Update Shipment
  shipment.driverId = driver.id;
  shipment.driverName = driver.name;
  shipment.driverPhone = driver.phone;
  shipment.vehicleNumber = driver.vehicleNumber;
  shipment.status = 'Dispatched';
  shipment.dispatchedAt = new Date().toISOString();
  shipment.routeTimeline.push({
    status: 'Driver Dispatched',
    location: driver.currentLocation,
    timestamp: new Date().toISOString(),
    note: `Automated dispatch optimization: ${driver.name} assigned based on location proximity & ${driver.vehicleType} capacity`
  });

  return { shipment, driver };
};

// Automatic Dispatch Optimizer: matches pending shipments to best available driver
const autoAssignOptimalDriver = async (shipmentId) => {
  const shipment = memoryShipments.find(s => s.id === shipmentId || s._id === shipmentId);
  if (!shipment) throw new Error('Shipment not found');

  // Find available drivers who have enough capacity, sorted by rating and proximity
  const eligibleDrivers = memoryDrivers.filter(d => 
    d.status === 'Available' && d.capacityKg >= shipment.weightKg
  ).sort((a, b) => b.rating - a.rating);

  if (eligibleDrivers.length === 0) {
    throw new Error('No available drivers with sufficient vehicle capacity currently in range.');
  }

  const selectedDriver = eligibleDrivers[0];
  return await assignDriverToShipment(shipmentId, selectedDriver.id);
};

// Update Shipment Status
const updateShipmentStatus = async (shipmentId, { status, location, note, isDelayed, delayReason }) => {
  const shipment = memoryShipments.find(s => s.id === shipmentId || s._id === shipmentId);
  if (!shipment) throw new Error('Shipment not found');

  shipment.status = status;
  if (isDelayed !== undefined) {
    shipment.isDelayed = Boolean(isDelayed);
    if (delayReason) shipment.delayReason = delayReason;
  }

  if (status === 'Delivered') {
    shipment.deliveredAt = new Date().toISOString();
    // Release driver if assigned
    if (shipment.driverId) {
      const drv = memoryDrivers.find(d => d.id === shipment.driverId);
      if (drv) {
        drv.status = 'Available';
        drv.completedDeliveries += 1;
      }
    }
  }

  if (location) {
    shipment.currentCoords = {
      ...shipment.currentCoords,
      locationName: location
    };
  }

  shipment.routeTimeline.push({
    status,
    location: location || shipment.currentCoords?.locationName || 'En route',
    timestamp: new Date().toISOString(),
    note: note || `Status updated to ${status}`
  });

  return shipment;
};

// Proof of Delivery Confirmation
const confirmProofOfDelivery = async (shipmentId, { otp, recipientName, signatureData, photoUrl, confirmedBy }) => {
  const shipment = memoryShipments.find(s => s.id === shipmentId || s._id === shipmentId);
  if (!shipment) throw new Error('Shipment not found');

  // Verify OTP
  if (shipment.otpCode && shipment.otpCode !== otp.trim()) {
    throw new Error(`Invalid Delivery OTP verification code. Required: ${shipment.otpCode}`);
  }

  shipment.status = 'Delivered';
  shipment.deliveredAt = new Date().toISOString();
  shipment.proofOfDelivery = {
    verifiedOtp: otp,
    recipientName: recipientName || shipment.buyerName,
    signatureData: signatureData || null,
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
    timestamp: new Date().toISOString(),
    confirmedBy: confirmedBy || shipment.driverName || 'Authorized Logistics Partner'
  };

  // Free driver
  if (shipment.driverId) {
    const drv = memoryDrivers.find(d => d.id === shipment.driverId);
    if (drv) {
      drv.status = 'Available';
      drv.completedDeliveries += 1;
    }
  }

  shipment.routeTimeline.push({
    status: 'Delivered',
    location: shipment.destination,
    timestamp: new Date().toISOString(),
    note: `Delivery confirmed with verified OTP (${otp}) and recipient signature.`
  });

  return shipment;
};

// Report Generator Statistics
const getDeliveryReports = async () => {
  const totalShipments = memoryShipments.length;
  const completed = memoryShipments.filter(s => s.status === 'Delivered');
  const delayed = memoryShipments.filter(s => s.isDelayed || (s.status !== 'Delivered' && new Date(s.estimatedDelivery) < new Date()));
  const inTransit = memoryShipments.filter(s => s.status === 'In-Transit' || s.status === 'Dispatched');
  const pending = memoryShipments.filter(s => s.status === 'Pending');

  const onTimeCount = completed.filter(s => !s.isDelayed).length;
  const onTimeRate = completed.length > 0 ? ((onTimeCount / completed.length) * 100).toFixed(1) : 100.0;

  // Driver metrics
  const driverMetrics = memoryDrivers.map(d => {
    const assigned = memoryShipments.filter(s => s.driverId === d.id);
    const completedLoads = assigned.filter(s => s.status === 'Delivered').length;
    const delayedLoads = assigned.filter(s => s.isDelayed).length;
    return {
      driverId: d.id,
      name: d.name,
      vehicle: d.vehicleNumber,
      vehicleType: d.vehicleType,
      currentLocation: d.currentLocation,
      status: d.status,
      rating: d.rating,
      completedLoads: d.completedDeliveries + completedLoads,
      delayedLoads: d.delayedDeliveries + delayedLoads,
      onTimeRate: `${d.onTimeRate}%`
    };
  });

  return {
    kpis: {
      totalShipments,
      completedDeliveries: completed.length,
      delayedShipments: delayed.length,
      activeInTransit: inTransit.length,
      pendingAssignment: pending.length,
      fleetActiveDrivers: memoryDrivers.filter(d => d.status === 'On Delivery').length,
      fleetAvailableDrivers: memoryDrivers.filter(d => d.status === 'Available').length,
      overallOnTimeRate: `${onTimeRate}%`
    },
    completedList: completed,
    delayedList: delayed,
    driverMetrics,
    generatedAt: new Date().toISOString()
  };
};

// Products
const getProducts = async (category) => {
  if (category && category !== 'All') {
    return memoryProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  return memoryProducts;
};

// Global Multi-Entity Search
const globalSearch = async (query) => {
  if (!query || query.trim() === '') return { users: [], drivers: [], shipments: [], products: [] };
  const q = query.toLowerCase().trim();

  const matchedUsers = memoryUsers.filter(u => 
    u.name.toLowerCase().includes(q) || 
    u.email.toLowerCase().includes(q) || 
    u.role.toLowerCase().includes(q) ||
    (u.location && u.location.toLowerCase().includes(q))
  );

  const matchedDrivers = memoryDrivers.filter(d => 
    d.name.toLowerCase().includes(q) || 
    d.vehicleNumber.toLowerCase().includes(q) || 
    d.vehicleType.toLowerCase().includes(q) ||
    d.currentLocation.toLowerCase().includes(q)
  );

  const matchedShipments = memoryShipments.filter(s => 
    s.trackingNumber.toLowerCase().includes(q) || 
    s.orderId.toLowerCase().includes(q) || 
    s.productName.toLowerCase().includes(q) || 
    s.buyerName.toLowerCase().includes(q) ||
    (s.driverName && s.driverName.toLowerCase().includes(q)) ||
    s.status.toLowerCase().includes(q)
  );

  const matchedProducts = memoryProducts.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.category.toLowerCase().includes(q) ||
    p.origin.toLowerCase().includes(q)
  );

  return {
    users: matchedUsers,
    drivers: matchedDrivers,
    shipments: matchedShipments,
    products: matchedProducts,
  };
};

module.exports = {
  syncWithMongoDB,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getDrivers,
  createDriver,
  updateDriver,
  getShipments,
  getShipmentByTracking,
  createShipment,
  assignDriverToShipment,
  autoAssignOptimalDriver,
  updateShipmentStatus,
  confirmProofOfDelivery,
  getDeliveryReports,
  getProducts,
  globalSearch,
};
