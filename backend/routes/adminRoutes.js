const express = require('express');
const Admin = require('../models/Admin');
const { adminAuthMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get admin profile
router.get('/profile', adminAuthMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin profile', error: error.message });
  }
});

// Update admin profile
router.put('/profile', adminAuthMiddleware, async (req, res) => {
  try {
    const { name, phone, designation } = req.body;
    
    const admin = await Admin.findByIdAndUpdate(
      req.adminId,
      { name, phone, designation, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', admin });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get all admins in same department
router.get('/department', adminAuthMiddleware, async (req, res) => {
  try {
    const admins = await Admin.find({ department: req.department }).select('-password');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admins', error: error.message });
  }
});

module.exports = router;
