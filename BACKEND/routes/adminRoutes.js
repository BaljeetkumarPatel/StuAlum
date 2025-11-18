
const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin,updateAdminProfile,getAdminProfile } = require('../controllers/adminController');
const { checkRole } = require('../middleware/checkRole');
const auth = require('../middleware/auth');

const checkOwnership = require('../middleware/checkOwnership');


router.post('/register', registerAdmin);
router.post('/login', loginAdmin);


// UPDATE ADMIN PROFILE (only own profile)
router.patch(
  '/edit/:id',
  auth,
  checkRole(['admin']),
  checkOwnership,
  updateAdminProfile
);


// GET admin profile
router.get(
  '/profile/:id',
  auth,
  checkRole(['admin']),
  checkOwnership,
  getAdminProfile
);

module.exports = router;

