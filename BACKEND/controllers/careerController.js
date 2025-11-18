// BACKEND/controllers/careerController.js (UPDATED RESPONSE STRUCTURE)

// Ensure these models/middleware are correctly imported and accessible
const ResumeReviewSession = require('../models/ResumeReviewSession');
const PrepResource = require('../models/PrepResource');
const CareerArticleVideo = require('../models/CareerArticleVideo');
const upload = require('../middleware/fileUpload'); // Assuming your Multer setup
const mongoose = require('mongoose');

// Helper function to determine the Mongoose model name based on role
const getProfileType = (role) => {
  if (role === 'student') return 'StudentProfile';
  if (role == 'alumni') return 'AlumniProfile';
  if (role === 'admin') return 'AdminProfile';
  return null;
};

// GET /api/career/resources
// Fetches both Prep Resources and Articles/Videos in a single API call
exports.getCareerResources = async (req, res) => {
  try {
    //  CHECK 1: Does the request reach here?
    console.log('C-LOG: 1. Request reached getCareerResources.');

    // Fetch Prep Resources
    console.log('C-LOG: 2. Querying PrepResource...');
    const prepResources = await PrepResource.find({})
      // .select('-__v -created_by')  //  Keep created_by or populate it if the frontend needs it
      .populate('created_by', 'name email') // Populate created_by
      .lean();
    console.log(`C-LOG: 3. Prep Resources fetched: ${prepResources.length}`);

    // Fetch Articles and Videos
    console.log('C-LOG: 4. Querying CareerArticleVideo...');
    const articlesAndVideos = await CareerArticleVideo.find({})
      .sort({ createdAt: -1 })
      // .select('-__v -created_by') // Keep created_by or populate it if the frontend needs it
      .populate('created_by', 'name email') // Populate created_by
      .lean();
    console.log(`C-LOG: 5. Articles/Videos fetched: ${articlesAndVideos.length}`);

    // Send response - STRUCTURED CORRECTLY
    res.json({
      data: {  // Wrap the resources in a 'data' object
        prepResources,
        articlesAndVideos,
      }
    });
    console.log('C-LOG: 6. Response sent successfully.');
  } catch (error) {
    console.error('Error in getCareerResources:', error);
    res.status(500).json({ message: 'Failed to fetch career resources', error: error.message });
  }
};

// GET /api/career/sessions
exports.getQASessions = async (req, res) => {
  // Placeholder logic for fetching Q&A/Mentorship sessions
  res.status(501).json({ message: 'Q&A session retrieval not yet implemented.' });
};

// POST /api/career/upload-resume (Handles file upload and session start)
exports.uploadResume = async (req, res) => {
  // 1. Wrap the core logic in the Multer middleware call
  upload(req, res, async (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(500).json({ message: 'File upload failed', error: err.message });
    }

    // 2. Access file details from req.file
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // 3. Extract other form data
    const { studentId, sessionType } = req.body;

    try {
      // 4. Create a new ResumeReviewSession document
      const newSession = new ResumeReviewSession({
        student: studentId,
        resumeUrl: req.file.path, // or req.file.filename depending on your storage
        sessionType: sessionType,
        status: 'pending', // Or any default status
      });

      // 5. Save the session to the database
      await newSession.save();

      // Respond with success message and session details
      res.status(201).json({ message: 'Resume uploaded and session started successfully', session: newSession });
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ message: 'Failed to create session', error: dbError.message });
    }
  });
};

// BACKEND/controllers/careerController.js (Add the createResource handler)

// POST /api/career/resource-create - Admin creates a new Prep Resource or Article
exports.createResource = async (req, res) => {
  try {
    const { resourceType } = req.body;

    if (resourceType === 'prep') {
      // Create a Prep Resource
      const newPrepResource = new PrepResource({
        ...req.body,
        created_by: req.user.adminProfile._id, // Assuming you have user info in req
      });
      await newPrepResource.save();
      res.status(201).json({ message: 'Prep Resource created', resource: newPrepResource });
    } else if (resourceType === 'article') {
      // Create a Career Article/Video
      const newArticleVideo = new CareerArticleVideo({
        ...req.body,
        created_by: req.user.adminProfile._id, // Assuming you have user info in req
      });
      await newArticleVideo.save();
      res.status(201).json({ message: 'Article/Video created', resource: newArticleVideo });
    } else {
      return res.status(400).json({ message: 'Invalid resource type' });
    }
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ message: 'Failed to create resource', error: error.message });
  }
};