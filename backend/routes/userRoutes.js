const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getUsers, createUser, updateUser, deleteUser } = require('../services/dataStore');

// List all users with filtering
router.get('/', async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const users = await getUsers({ role, status, search });
    const sanitized = users.map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });
    res.json({ success: true, count: sanitized.length, users: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, phone, location, status } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const all = await getUsers();
    if (all.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password || 'pass123', 8);
    const created = await createUser({
      name,
      email,
      password: hashedPassword,
      plainPassword: password || 'pass123',
      role: role || 'Buyer',
      phone: phone || '',
      location: location || 'Regional Farm Hub',
      status: status || 'Active',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    });

    const safe = { ...created };
    delete safe.password;
    res.status(201).json({ success: true, message: 'User created successfully', user: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update user profile or role/status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 8);
    }
    const updated = await updateUser(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const safe = { ...updated };
    delete safe.password;
    res.json({ success: true, message: 'User updated successfully', user: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteUser(id);
    res.json({ success: true, message: 'User removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
