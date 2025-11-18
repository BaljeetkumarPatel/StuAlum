// BACKEND/routes/alumniRoutes.js

const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');
const checkOwnership = require('../middleware/checkOwnership');
const {
    registerAlumni,
    loginAlumni,
    getAlumniDirectory, // Existing import for directory list
    getAlumniProfileById,
    // 🛑 ADDED: Import the function to handle CSV export
    exportAlumniToCSV,
    inviteAlumni,
    updateAlumniProfile
} = require('../controllers/alumniController');

// --- Authentication Routes ---

router.post('/register', upload.fields([
    { name: 'verificationFile', maxCount: 1 },
    { name: 'profile_photo_url', maxCount: 1 },
]), registerAlumni);

router.post('/login', loginAlumni);

// --- Alumni Directory & Profile Routes ---

// Existing: Route to fetch the list of alumni for the directory
router.get('/directory', getAlumniDirectory);

// 🛑 NEW ROUTE: Handles the export of the directory data to CSV
// This route is called by the frontend's "Export" button
router.get('/export', exportAlumniToCSV);

// Existing: Dynamic route to fetch a single alumni profile by ID
router.get('/:id', getAlumniProfileById);

// 🛑 NEW ROUTE: Invite Alumni (Admin only)
router.post('/invite', auth, checkRole(['admin']), inviteAlumni);


// UPDATE ALUMNI PROFILE
router.patch(
  '/edit/:id',
  auth,
  checkRole(['alumni']),
  checkOwnership,
  upload.fields([
    { name: 'profile_photo_url', maxCount: 1 },
    { name: 'verificationFile', maxCount: 1 }
  ]),
  updateAlumniProfile
);

module.exports = router;
