// backend/middleware/checkOwnership.js
module.exports = function checkOwnership(req, res, next) {
  const user = req.user; // set by auth middleware
  const targetId = req.params.id;

  if (!user || !user.id) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  // Compare as strings (handles ObjectId vs string)
  if (String(user.id) === String(targetId)) return next();

  return res.status(403).json({ message: 'You may only edit your own profile.' });
};
