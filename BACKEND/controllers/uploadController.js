// BACKEND/controllers/uploadController.js
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const ResumeReviewSession = require('../models/ResumeReviewSession');
const { appendMessage } = require('../services/chatHistoryService');
const { processResume } = require('../services/resumeProcessor');


// MULTER STORAGE (RESUME UPLOAD)
const resumeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/resumes');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const timeStamp = Date.now();
    const cleanName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timeStamp}_${cleanName}`);
  }
});

const upload = multer({
  storage: resumeStorage,
  fileFilter: function (req, file, cb) {
    if (!file.originalname.toLowerCase().endsWith('.pdf')) {
      return cb(new Error('Only PDF files allowed'));
    }
    cb(null, true);
  }
});


//  UPLOAD RESUME HANDLER
async function uploadResumeHandler(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume uploaded"
      });
    }

    const userId = req.user.id;
    const role = req.user.role;

    // Create session
    const session = await ResumeReviewSession.create({
      user_id: userId,
      user_model_type: role === 'alumni' ? 'AlumniProfile' : 'StudentProfile',
      resume_path: req.file.path,
      original_filename: req.file.originalname,
      status: "Started",
      initial_analysis: "Queued for AI review"
    });

    // Add event to hidden chat history
    try {
      await appendMessage(
        userId,
        role,
        "user",
        `💾 Uploaded resume: ${req.file.originalname}`
      );
    } catch (err) {
      console.warn("Failed to append to chat history:", err.message);
    }

    // START BACKGROUND PROCESS (non-blocking)
    processResume(session._id)
      .catch(err => console.error("Background resume processing failed:", err));

    return res.json({
      success: true,
      message: "Resume uploaded and queued for review",
      sessionId: session._id
    });

  } catch (err) {
    console.error("uploadResumeHandler error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}


//  RESUME STATUS POLLING
async function getResumeStatus(req, res) {
  try {
    const { sessionId } = req.params;

    const session = await ResumeReviewSession.findById(sessionId).lean();
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Resume review session not found"
      });
    }

    // Security check: owner OR admin
    if (String(session.user_id) !== String(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    return res.json({
      success: true,
      status: session.status,
      review: session.status === "Ready" ? session.initial_analysis : null
    });
  } catch (err) {
    console.error("getResumeStatus error:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
}

// ---------------------------
// EXPORTS
// ---------------------------
module.exports = {
  upload,
  uploadResumeHandler,
  getResumeStatus
};
