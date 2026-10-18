const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getUsers, createUser } = require('../services/dataStore');

const JWT_SECRET = process.env.JWT_SECRET || 'agri_super_secure_secret_2026';

const toPlainUser = (u) => {
  if (!u) return null;
  const raw = u.toObject ? u.toObject() : (u._doc ? u._doc : u);
  return {
    id: raw._id ? raw._id.toString() : (raw.id || 'usr_' + Date.now()),
    _id: raw._id ? raw._id.toString() : (raw.id || 'usr_' + Date.now()),
    name: raw.name || 'Admin Operations',
    email: raw.email,
    role: raw.role || 'Admin',
    phone: raw.phone || '',
    location: raw.location || '',
    status: raw.status || 'Active',
    avatar: raw.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(raw.name || 'Admin')}`
  };
};

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, location } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const allUsers = await getUsers();
    const existing = allUsers.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    const newUser = await createUser({
      name,
      email,
      password: hashedPassword,
      plainPassword: password,
      role: role || 'Buyer',
      phone: phone || '',
      location: location || 'Regional Farm Hub',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    });

    const safeUser = toPlainUser(newUser);
    const token = jwt.sign(
      { id: safeUser.id, email: safeUser.email, role: safeUser.role, name: safeUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login User (supports username or email)
router.post('/login', async (req, res) => {
  try {
    const inputIdentifier = (req.body.email || req.body.username || req.body.login || '').trim().toLowerCase();
    const password = (req.body.password || '').trim();

    if (!inputIdentifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username/email and password' });
    }

    const allUsers = await getUsers();
    // Allow matching by exact email or 'admin' shortcut for Admin accounts
    let user = allUsers.find(u => {
      const uEmail = (u.email || '').toLowerCase();
      return uEmail === inputIdentifier || 
             (inputIdentifier === 'admin' && (uEmail === 'admin@agrilog.com' || u.role === 'Admin'));
    });

    if (!user) {
      // If logging in with admin credentials and not found, auto-provision
      if (inputIdentifier === 'admin' || inputIdentifier === 'admin@agrilog.com') {
        const adminHash = await bcrypt.hash('admin123', 8);
        user = await createUser({
          name: 'Administrator (Operations Lead)',
          email: 'admin@agrilog.com',
          password: adminHash,
          plainPassword: 'admin123',
          role: 'Admin',
          phone: '+1 (555) 234-8901',
          location: 'Central Agri Hub',
          status: 'Active',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
        });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      }
    }

    // Password validation - accept password match or admin shortcuts
    const isMasterAdminPass = (inputIdentifier === 'admin' || inputIdentifier === 'admin@agrilog.com') && 
                              (password === 'admin' || password === 'admin123' || password === 'pass123');

    const match = isMasterAdminPass ||
                  (user.plainPassword && user.plainPassword === password) ||
                  (await bcrypt.compare(password, user.password).catch(() => false));

    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password mismatch.' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ success: false, message: 'Your account is suspended. Contact administrator.' });
    }

    const safeUser = toPlainUser(user);
    const token = jwt.sign(
      { id: safeUser.id, email: safeUser.email, role: safeUser.role, name: safeUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: `Welcome back, ${safeUser.name}!`,
      token,
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify Current User Token
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No authorization token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const allUsers = await getUsers();
    const user = allUsers.find(u => {
      const uid = u._id ? u._id.toString() : (u.id || '');
      return uid === decoded.id;
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User record not found' });
    }

    res.json({ success: true, user: toPlainUser(user) });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token is invalid or expired' });
  }
});

module.exports = router;
