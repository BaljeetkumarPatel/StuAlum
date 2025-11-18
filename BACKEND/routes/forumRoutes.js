// routes/forumRoutes.js
const express = require('express');
const router = express.Router();
// Assuming you have an auth middleware that verifies token and sets req.user
const auth = require('../middleware/auth'); 
const { checkRole } = require('../middleware/checkRole'); 
const forumController = require('../controllers/forumController');

// Helper role arrays
const ALL_USERS = ['student', 'alumni'];
const ADMIN_ONLY = ['admin'];

// --- 1. Content Retrieval ---
router.get('/categories', auth, forumController.getCategories);
router.get('/posts', auth, forumController.getPosts);
router.get('/posts/:postId', auth, forumController.getPostDetail);
router.get('/posts/:postId/comments', auth, forumController.getPostComments);


// --- 2. User Interaction (Student/Alumni) ---
// Post creation requires Student or Alumni role
router.post('/posts', auth, checkRole(['admin','alumni']), forumController.createPost);
router.post('/comments', auth, checkRole(ALL_USERS), forumController.createComment);

// FIX: ADDED MISSING ROUTE FOR COMMENT DELETION
router.delete('/comments/:commentId', auth, checkRole(ALL_USERS), forumController.deleteComment);

router.post('/likes', auth, checkRole(ALL_USERS), forumController.toggleLike);
router.post('/report', auth, checkRole(ALL_USERS), forumController.reportContent);

// Post editing/deletion must check if the user is the author within the controller
router.put('/posts/:postId', auth, checkRole(ALL_USERS), forumController.updatePost);
router.delete('/posts/:postId', auth, checkRole(ALL_USERS), forumController.deletePost); 


// --- 3. Administration & Moderation (Admin Only) ---
router.post('/admin/categories', auth, checkRole(ADMIN_ONLY), forumController.createCategory);
router.put('/admin/posts/:postId/pin', auth, checkRole(ADMIN_ONLY), forumController.togglePin);
router.delete('/admin/posts/:postId', auth, checkRole(ADMIN_ONLY), forumController.adminDeletePost);
// FIX: ADDED ROUTE FOR FETCHING PENDING REPORTS
router.get('/admin/reports', auth, checkRole(ADMIN_ONLY), forumController.getPendingReports);
// FIX: ADDED ROUTE FOR RESOLVING REPORTS
router.put('/admin/reports/:reportId', auth, checkRole(ADMIN_ONLY), forumController.resolveReport);

module.exports = router;