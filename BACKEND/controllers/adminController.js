
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminProfile = require('../models/AdminProfile');

exports.registerAdmin = async (req, res) => {
  try {
    const data = req.body;

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      return res.status(400).json({ error: "Password is required" });
    }

    const newAdmin = new AdminProfile({
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      confirm_password: data.confirm_password,
      designation: data.designation,
      department: data.department,
      contact_office: data.contact_office,
      college_id: data.college_id,
      admin_level: data.admin_level || "admin",
      permissions: data.permissions || { edit_user: false, manage_events: false },
    });

    await newAdmin.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

exports.loginAdmin = async (req, res) => {
  console.log('Admin login route hit');
  const { email, password } = req.body;

  try {
    const user = await AdminProfile.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: 'admin', email: user.email }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: { id: user._id, full_name: user.full_name, email: user.email },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};





//profile detail



exports.updateAdminProfile = async (req, res) => {
  try {
    // require authentication middleware to set req.user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const requesterId = String(req.user.id);
    const requesterRole = (req.user.role || '').toLowerCase();

    // Only allow an admin to update their own profile.
    // If you want some admin role to edit others, implement that logic here.
    if (requesterRole !== 'admin' || requesterId !== String(req.params.id)) {
      return res.status(403).json({ message: 'Forbidden: cannot update this admin' });
    }

    const data = { ...req.body };

    // Remove any blocked fields (never allow changing these from this endpoint)
    const BLOCKED = ['admin_level', 'permissions', 'email', 'is_superadmin'];
    BLOCKED.forEach(k => { if (k in data) delete data[k]; });

    // If password provided -> hash it
    if (data.password) {
      data.password = await bcrypt.hash(String(data.password), 10);
    }

    // Whitelist allowed fields
    const ALLOWED = ['full_name','designation','department','contact_office','college','password'];

    const payload = {};
    Object.keys(data).forEach(k => {
      if (ALLOWED.includes(k)) payload[k] = data[k];
    });

    const updatedAdmin = await AdminProfile.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    return res.json({ message: 'Admin profile updated successfully', admin: updatedAdmin });
  } catch (err) {
    console.error('Error updating admin:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// GET ADMIN PROFILE 
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await AdminProfile.findById(req.params.id).select('-password');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Only allow admin to view their own profile
    if (!req.user || req.user.role !== 'admin' || String(req.user.id) !== String(admin._id)) {
      return res.status(403).json({ message: 'Forbidden: cannot view this admin' });
    }

    return res.json(admin);

  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
