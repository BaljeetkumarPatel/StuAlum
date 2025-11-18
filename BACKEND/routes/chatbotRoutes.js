// BACKEND/routes/chatbotRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { upload, uploadResumeHandler, getResumeStatus } = require('../controllers/uploadController');
const { chatbotController } = require('../controllers/chatbotController');

// Chat endpoint
router.post('/query', auth, chatbotController);

// Resume upload
router.post('/upload-resume', auth, upload.single("resume"), uploadResumeHandler);

// Resume review polling
router.get('/resume-status/:sessionId', auth, getResumeStatus);

module.exports = router;
