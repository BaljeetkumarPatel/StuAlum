const bcrypt = require('bcryptjs');
const StudentProfile = require('../models/StudentProfile');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'THIS_IS_MY_VERY_STRONG_AND_UNIQUE_SECRET_FOR_STUALUM';

exports.registerStudent = async (req, res) => {
  try {
    const data = req.body;

    if (req.files) {
      if (req.files.photo && req.files.photo.length > 0) {
        data.photo = '/uploads/' + req.files.photo[0].filename;
      }
      if (req.files.verificationFile && req.files.verificationFile.length > 0) {
        data.verificationFile = '/uploads/' + req.files.verificationFile[0].filename;
      }
    }

    // Prevent duplicate registration
    const existing = await StudentProfile.findOne({ email: data.email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    //end of adding new line to Prevent duplicate registration later remove these above two lines if get error
    ['skills', 'interests', 'communication', 'projects'].forEach(field => {
      if (data[field]) {
        if (typeof data[field] === 'string') {
          try {
            data[field] = JSON.parse(data[field]);
          } catch {
            if (field === 'projects') {
              // Special handling for projects - expect array of objects
              data[field] = [];
            } else {
              data[field] = data[field].split(',').map(s => s.trim());
            }
          }
        }
      } else {
        data[field] = [];
      }
    });

    if (typeof data.notifications === 'string') {
      try {
        data.notifications = JSON.parse(data.notifications);
      } catch {
        data.notifications = {
          mentorship: true,
          events: true,
          community: false,
          content: true,
        };
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      return res.status(400).json({ error: "Password is required" });
    }

    const newStudentData = {
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      enrollment_number: data.enrollment_number,
      branch: data.branch,
      year_of_admission: data.year_of_admission ? Number(data.year_of_admission) : undefined,
      year_of_graduation: data.year_of_graduation ? Number(data.year_of_graduation) : undefined,
      contact_number: data.contact_number,
      address: data.address,
      skills: data.skills,
      interests: data.interests,
      career_goals: data.career_goal,
      discovery_insights: data.discovery_insights,
      preferences: data.preferences,
      photo: data.photo,
      verificationFile: data.verificationFile,
      linkedin: data.linkedin_url,
      github: data.github_url,
      extracurricular: data.extracurricular,
      is_verified: false,
      notifications: data.notifications,
      mentorship_area: data.mentorship_area,
      mentor_type: data.mentor_type,
      communication: data.communication,
      hear_about: data.hear_about,
      projects: data.projects,
    };

    const newStudent = new StudentProfile(newStudentData);
    await newStudent.save();

    res.status(201).json({ message: 'Student registered successfully' });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

exports.loginStudent = async (req, res) => {
  console.log('Login route hit');
  const { email, password } = req.body;

  try {
    const user = await StudentProfile.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: 'student', email: user.email }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: { id: user._id, full_name: user.full_name, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Student Directory Listing ---
exports.getStudentDirectory = async (req, res) => {
  try {
    const { nameOrKeyword, branch, yearOfGraduation, skills, limit = 20, skip = 0 } = req.query;
    const numLimit = Number(limit);
    const numSkip = Number(skip);
    const filters = {};

    if (nameOrKeyword) {
      const searchRegex = new RegExp(nameOrKeyword, 'i');
      filters.$or = [
        { full_name: searchRegex },
        { branch: searchRegex },
        { skills: { $elemMatch: { $regex: searchRegex } } },
        { interests: { $elemMatch: { $regex: searchRegex } } },
      ];
    }

    if (branch) filters.branch = new RegExp(branch, 'i');
    if (yearOfGraduation) filters.year_of_graduation = Number(yearOfGraduation);
    if (skills) filters.skills = { $elemMatch: { $regex: new RegExp(skills, 'i') } };

    let studentList;
    let totalCount;

    if (Object.keys(filters).length === 0) {
      totalCount = await StudentProfile.countDocuments({});
      studentList = await StudentProfile.aggregate([
        { $match: {} },
        { $sample: { size: numLimit } },
        { $project: { full_name: 1, branch: 1, year_of_graduation: 1, skills: 1, interests: 1, photo: 1 } }
      ]);
    } else {
      totalCount = await StudentProfile.countDocuments(filters);
      studentList = await StudentProfile.find(filters)
        .select('full_name branch year_of_graduation skills interests photo')
        .limit(numLimit)
        .skip(numSkip)
        .lean();
    }

    const formattedStudents = studentList.map(student => ({
      id: student._id,
      name: student.full_name,
      branch: student.branch,
      yearOfGraduation: student.year_of_graduation,
      profileImage: student.photo || '/path/to/default/image.png',
      tags: [...(student.skills || []).slice(0, 3), ...(student.interests || []).slice(0, 2)].slice(0, 5),
    }));

    res.status(200).json({ students: formattedStudents, total: totalCount });
  } catch (error) {
    console.error('Error fetching student directory:', error);
    res.status(500).json({ message: 'Error fetching student directory', error: error.message });
  }
};

//  Get Student Profile By ID
exports.getStudentProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await StudentProfile.findById(id).select('-password');
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    const profile = student.toObject();
    res.status(200).json(profile);
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(400).json({ message: 'Invalid profile ID format' });
    console.error('Error fetching student profile by ID:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};


// --- Get Current Logged-in Student Profile -----baad main deelte kr dena agara kaam nhi kiya to
// exports.getCurrentStudentProfile = async (req, res) => {
//   try {
//     // The JWT middleware (auth.js) already puts user info into req.user
//     const studentId = req.user.id;

//     const student = await StudentProfile.findById(studentId).select('-password');
//     if (!student) {
//       return res.status(404).json({ message: 'Student profile not found' });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Fetched current student profile successfully",
//       data: student,
//     });
//   } catch (error) {
//     console.error("Error fetching current student profile:", error);
//     res.status(500).json({ message: "Server error while fetching profile" });
//   }
// };

//yaha tk





















exports.updateStudentProfile = async (req, res) => {
  try {
    // Ensure auth middleware set req.user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const requesterId = String(req.user.id);
    const requesterRole = (req.user.role || '').toLowerCase();
    const targetId = req.params.id;
    if (!targetId) return res.status(400).json({ message: 'Missing target student id' });

    // Only the student herself may update their profile
    if (!(requesterRole === 'student' && requesterId === String(targetId))) {
      return res.status(403).json({ message: 'Forbidden: you can only update your own student profile' });
    }

    // Work with a shallow copy of body
    const data = { ...(req.body || {}) };

    // Handle uploaded files (multer) -> set correct public path
    if (req.files) {
      if (req.files.photo && req.files.photo.length > 0) {
        data.photo = '/uploads/' + req.files.photo[0].filename;
      }
      if (req.files.verificationFile && req.files.verificationFile.length > 0) {
        data.verificationFile = '/uploads/' + req.files.verificationFile[0].filename;
      }
    }

    // Normalize array fields: accept JSON strings or comma-separated lists
    ['skills', 'interests', 'communication', 'projects'].forEach(field => {
      if (data[field] !== undefined) {
        if (typeof data[field] === 'string') {
          try {
            const parsed = JSON.parse(data[field]);
            data[field] = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            // treat as comma separated
            data[field] = data[field].split(',').map(s => s.trim()).filter(Boolean);
            // for projects, convert to array of objects if simple titles supplied
            if (field === 'projects' && data[field].every(x => typeof x === 'string')) {
              data[field] = data[field].map(title => ({ title }));
            }
          }
        } else if (!Array.isArray(data[field])) {
          data[field] = [data[field]];
        }
      }
    });

    // If password update requested -> hash it
    if (data.password) {
      data.password = await bcrypt.hash(String(data.password), 10);
    }

    // Prevent students from changing admin-only fields explicitly
    const forbidden = ['is_verified', 'engagement_status', 'prospect_type'];
    for (const f of forbidden) {
      if (f in data) {
        return res.status(403).json({ message: `Only admin can change ${f}` });
      }
    }

    // Whitelist allowed fields (what front-end can send)
    const ALLOWED_FIELDS = [
      'full_name',
      'enrollment_number',
      'contact_number',
      'address',
      'skills',
      'interests',
      'career_goals',
      'discovery_insights',
      'preferences',
      'photo',
      'verificationFile',
      'linkedin',
      'github',
      'extracurricular',
      'notifications',
      'mentorship_area',
      'mentor_type',
      'communication',
      'hear_about',
      'projects',
      'current_position',
      'company',
      'profile_photo_url',
      'password',
      'branch',
      'year_of_admission',
      'year_of_graduation'
    ];

    const updatePayload = {};
    Object.keys(data).forEach(k => {
      if (ALLOWED_FIELDS.includes(k)) updatePayload[k] = data[k];
    });

    // cast numeric fields if present
    if (updatePayload.year_of_admission !== undefined) {
      const n = Number(updatePayload.year_of_admission);
      if (!Number.isNaN(n)) updatePayload.year_of_admission = n;
      else delete updatePayload.year_of_admission;
    }
    if (updatePayload.year_of_graduation !== undefined) {
      const n = Number(updatePayload.year_of_graduation);
      if (!Number.isNaN(n)) updatePayload.year_of_graduation = n;
      else delete updatePayload.year_of_graduation;
    }

    // Run update
    const updatedStudent = await StudentProfile.findByIdAndUpdate(
      targetId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.json({
      message: 'Profile updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
