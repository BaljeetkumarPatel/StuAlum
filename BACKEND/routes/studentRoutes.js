const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { registerStudent, loginStudent, getStudentDirectory, getStudentProfileById,getCurrentStudentProfile,updateStudentProfile } = require('../controllers/studentController');
const auth = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');
const checkOwnership = require('../middleware/checkOwnership');


router.post('/register', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'verificationFile', maxCount: 1 },
]), registerStudent);

router.post('/login', loginStudent);

router.get('/directory', getStudentDirectory);

router.get('/profile/:id', getStudentProfileById);


// NEW — Update student profile
router.patch(
  '/edit/:id',
  auth,
  checkRole(['student']),
  checkOwnership,
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'verificationFile', maxCount: 1 },
  ]),
  updateStudentProfile
);



module.exports = router;
