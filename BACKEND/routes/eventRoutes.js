// BACKEND/routes/eventRoutes.js (No structural change needed, but included for completeness)

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth'); 
const { checkRole } = require('../middleware/checkRole'); 

const ALL_USERS = ['student', 'alumni', 'admin']; // All can view/register
const ADMIN_ONLY = ['admin'];

// GET /api/events - Retrieve filtered list of upcoming events (Visible to all)
router.get('/', auth, checkRole(ALL_USERS), eventController.getEvents);

// POST /api/events - Create new event (Admin only)
// router.post('/', auth, checkRole(['admin', 'alumni']), eventController.createEvent);
router.post(
    '/',
    auth,
    (req, res, next) => {
        console.log("🔥 ROLE HITTING ROUTE:", req.user.role);
        console.log("🔥 ALLOWED ROLES:", ['admin', 'alumni']);
        next();
    },
    checkRole(['admin', 'alumni']),
    eventController.createEvent
);

// POST /api/events/:eventId/register - User registration for an event (Open to all)
router.post('/:eventId/register', auth, checkRole(ALL_USERS), eventController.registerForEvent);
// BACKEND/routes/eventRoutes.js
router.delete('/:eventId', auth, checkRole(['admin','alumni']), eventController.deleteEvent);

//ai
const { generateEventPlan } = require("../controllers/eventController");
router.post("/generate", generateEventPlan);

router.post("/publish", auth, checkRole(['admin']), eventController.publishEvent);


module.exports = router;