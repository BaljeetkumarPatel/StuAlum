// routes/pointsRoutes.js
const express = require('express');
const router = express.Router();
const { getUserPoints, getLeaderboard, awardPoints,getUserInfo } = require('../controllers/pointsController');

router.get('/leaderboard', getLeaderboard);
router.get('/:userId', getUserPoints);
router.post('/award', awardPoints);
router.get('/userinfo/:id', getUserInfo);

module.exports = router;
