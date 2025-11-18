const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');
const AlumniProfile = require('../models/AlumniProfile');
const AdminProfile = require('../models/AdminProfile');

exports.registerAlumni = async (req, res) => {
  try {
    const data = req.body;

    // Handle uploaded files
    if (req.files['verificationFile'] && req.files['verificationFile'].length > 0) {
      data.verificationFile = '/uploads/' + req.files['verificationFile'][0].filename;
    }
    if (req.files['profile_photo_url'] && req.files['profile_photo_url'].length > 0) {
      data.profile_photo_url = '/uploads/' + req.files['profile_photo_url'][0].filename;
    }

    // Normalize string fields that should be arrays
    ['skills', 'contribution_preferences', 'communication'].forEach(field => {
      if (data[field]) {
        if (typeof data[field] === 'string') {
          try {
            data[field] = JSON.parse(data[field]);
          } catch {
            data[field] = data[field].split(',').map(s => s.trim());
          }
        }
      } else {
        data[field] = [];
      }
    });

    if (!data.user_id) {
      data.user_id = new mongoose.Types.ObjectId();
    }

    if (data.graduation_year) data.graduation_year = Number(data.graduation_year);
    if (data.yearsOfExperience) data.yearsOfExperience = Number(data.yearsOfExperience);

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      return res.status(400).json({ error: "Password is required" });
    }

    const existingAlumni = await AlumniProfile.findOne({ email: data.email });
    if (existingAlumni) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const newAlumni = new AlumniProfile({
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      contact_number: data.contact_number,
      linkedin_url: data.linkedin_url,
      github_url: data.github_url,
      leetcode_url: data.leetcode_url,
      college_id: data.college_id,
      graduation_year: data.graduation_year,
      verificationFile: data.verificationFile,
      degree: data.degree,
      current_position: data.current_position,
      company: data.company,
      industry: data.industry,
      location: data.location,
      years_of_experience: data.yearsOfExperience,
      skills: data.skills,
      professional_achievements: data.professional_achievements,
      contribution_preferences: data.contribution_preferences,
      preferred_communication: data.communication,
      about_me: data.about_me,
      profile_photo_url: data.profile_photo_url,
      twitter: data.twitter,
      portfolio: data.portfolio,
      is_verified: false,
      engagement_status: data.engagement_status || 'inactive',
      prospect_type: data.prospect_type,
      user_id: data.user_id,
    });

    await newAlumni.save();
    res.status(201).json({ message: 'Alumni registered successfully' });
  } catch (error) {
    console.error('Error registering alumni:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

exports.loginAlumni = async (req, res) => {
  console.log('Alumni login route hit');
  const { email, password } = req.body;

  try {
    const user = await AlumniProfile.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: 'alumni', email: user.email }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: { id: user._id, full_name: user.full_name, email: user.email },
    });
  } catch (error) {
    console.error('Alumni login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Alumni Directory Listing ---

exports.getAlumniDirectory = async (req, res) => {
  try {
    const { nameOrKeyword, gradYear, company, industry, remoteFriendly, hiring, mentorReady, limit = 20, skip = 0 } = req.query;
    const numLimit = Number(limit);
    const numSkip = Number(skip);
    const filters = {};
    if (nameOrKeyword) {
      const searchRegex = new RegExp(nameOrKeyword, 'i');
      filters.$or = [
        { full_name: searchRegex }, { company: searchRegex },
        { industry: searchRegex }, { skills: { $elemMatch: { $regex: searchRegex } } },
      ];
    }
    if (gradYear) filters.graduation_year = Number(gradYear);
    if (company) filters.company = new RegExp(company, 'i');
    if (industry) filters.industry = new RegExp(industry, 'i');
    if (remoteFriendly === 'true') filters.is_remote_friendly = true;
    if (hiring === 'true') filters.is_hiring = true;
    if (mentorReady === 'true') filters.is_mentor_ready = true;

    let alumniList;
    let totalCount;

    if (Object.keys(filters).length === 0) {
      totalCount = await AlumniProfile.countDocuments({});
      alumniList = await AlumniProfile.aggregate([
        { $match: {} }, { $sample: { size: numLimit } },
        { $project: { full_name: 1, current_position: 1, company: 1, location: 1, profile_photo_url: 1, skills: 1, graduation_year: 1, contribution_preferences: 1 } }
      ]);
    } else {
      totalCount = await AlumniProfile.countDocuments(filters);
      alumniList = await AlumniProfile.find(filters)
        .select('full_name current_position company location profile_photo_url skills graduation_year contribution_preferences user_id')
        .limit(numLimit)
        .skip(numSkip)
        .lean();
    }

    const formattedAlumni = alumniList.map(alumnus => ({
      id: alumnus._id, user_id: alumnus._id, name: alumnus.full_name, title: alumnus.current_position,
      company: alumnus.company, location: alumnus.location,
      profileImage: alumnus.profile_photo_url || '/path/to/default/image.png',
      skills: (alumnus.skills || []).slice(0, 3),
      contribution_preferences: (alumnus.contribution_preferences || []).slice(0, 2),
      gradYear: alumnus.graduation_year,
    }));

    res.status(200).json({ alumni: formattedAlumni, total: totalCount });

  } catch (error) {
    console.error('Error fetching alumni directory:', error);
    res.status(500).json({ message: 'Error fetching alumni directory', error: error.message });
  }
};

// --- Alumni Profile By ID ---
exports.getAlumniProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const alumni = await AlumniProfile.findById(id).select('-password');
    if (!alumni) return res.status(404).json({ message: 'Alumni profile not found' });
    const profile = alumni.toObject();
    res.status(200).json(profile);
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(400).json({ message: 'Invalid profile ID format' });
    console.error('Error fetching alumni profile by ID:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};


// --- Invite Alumni ---


exports.inviteAlumni = async (req, res) => {
  const { emails } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ message: 'A list of emails is required.' });
  }

  try {
    // Fetch the logged-in admin's details
    const admin = await AdminProfile.findById(req.user.id).select('full_name email');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    // Initialize MailerSend
    const mailersend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY,
    });

    // NOTE: Filter out existing users before sending (optional but good practice)
    const existingAlumni = await AlumniProfile.find({ email: { $in: emails } }).select('email');
    const existingEmails = new Set(existingAlumni.map(a => a.email));
    const newEmails = emails.filter(email => !existingEmails.has(email));

    if (newEmails.length === 0) {
      return res.status(200).json({ message: 'All provided emails are already registered.' });
    }

    // For MailerSend trial account, you can only send to verified emails
    // For now, we'll send to the admin's email as a test, or you need to verify recipient domains
    const verifiedRecipients = newEmails.filter(email =>
      email.includes('@gmail.com') || email.includes('@yahoo.com') ||
      email === admin.email // Allow admin's email for testing
    );

    if (verifiedRecipients.length === 0) {
      return res.status(400).json({
        message: 'MailerSend trial account can only send to verified email addresses. Please verify recipient domains in MailerSend dashboard or upgrade your account.'
      });
    }

    // Create recipients - use verified emails only
    const recipients = verifiedRecipients.map(email => new Recipient(email, ''));

    // Use a verified sender - for trial, you might need to use your MailerSend verified email
    // If admin.email is not verified, use a placeholder or your verified email
    const verifiedSenderEmail = process.env.MAILERSEND_VERIFIED_EMAIL || admin.email;

    // Create email parameters
    const emailParams = new EmailParams()
      .setFrom(new Sender(verifiedSenderEmail, admin.full_name))
      .setTo(recipients)
      .setReplyTo(new Sender(admin.email, admin.full_name))
      .setSubject('Invitation to Join the Alumni Network')
      .setHtml(`
        <h1>Welcome to the Alumni Network!</h1>
        <p>You have been invited to join our alumni directory by ${admin.full_name} (${admin.email}). Please register at <a href="http://localhost:3000/register">our website</a> to connect with fellow alumni.</p>
        <p>Best regards,<br>${admin.full_name}</p>
      `);

    await mailersend.email.send(emailParams);

    res.status(200).json({
      message: `Invitations sent successfully to ${verifiedRecipients.length} emails.`,
    });

  } catch (error) {
    // Log the actual error for debugging
    console.error('Error sending invitations:', error);
    // Provide a generic error message to the client
    res.status(500).json({ message: 'Failed to send invitations. Check server logs for config errors.' });
  }
};

// --- Export CSV Function ---
exports.exportAlumniToCSV = async (req, res) => {
  try {
    const { nameOrKeyword, gradYear, company, industry, remoteFriendly, hiring, mentorReady } = req.query;
    // 1. Build Filters (reuse logic from getAlumniDirectory)
    const filters = {};
    if (nameOrKeyword) {
      const searchRegex = new RegExp(nameOrKeyword, 'i');
      filters.$or = [
        { full_name: searchRegex }, { company: searchRegex },
        { industry: searchRegex }, { skills: { $elemMatch: { $regex: searchRegex } } },
      ];
    }
    if (gradYear) filters.graduation_year = Number(gradYear);
    if (company) filters.company = new RegExp(company, 'i');
    if (industry) filters.industry = new RegExp(industry, 'i');
    if (remoteFriendly === 'true') filters.is_remote_friendly = true;
    if (hiring === 'true') filters.is_hiring = true;
    if (mentorReady === 'true') filters.is_mentor_ready = true;

    // 2. Fetch ALL matching data (No limits/skip needed for export)
    const alumniData = await AlumniProfile.find(filters)
      .select('full_name email contact_number graduation_year degree current_position company industry location skills contribution_preferences')
      .lean();

    if (alumniData.length === 0) {
      return res.status(404).send('No alumni found matching criteria to export.');
    }
    // 3. Format data to CSV
    const headers = ["Full Name", "Email", "Contact", "Graduation Year", "Degree", "Position", "Company", "Industry", "Location", "Skills", "Contributions"];
    const rows = alumniData.map(alumnus => [
      `"${alumnus.full_name}"`, alumnus.email, alumnus.contact_number || '', alumnus.graduation_year, alumnus.degree || '',
      `"${alumnus.current_position || ''}"`, `"${alumnus.company || ''}"`, `"${alumnus.industry || ''}"`,
      `"${alumnus.location || ''}"`, `"${(alumnus.skills || []).join(', ')}"` ,
      `"${(alumnus.contribution_preferences || []).join(', ')}"`
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');

    // 4. Send the CSV file
    res.header('Content-Type', 'text/csv');
    res.attachment('alumni_directory_export.csv');
    res.send(csv);

  } catch (error) {
    console.error('Error exporting alumni data:', error);
    res.status(500).json({ message: 'Server error during export.' });
  }
};














//  UPDATE ALUMNI PROFILE
// Only the alumni owner can update their profile
exports.updateAlumniProfile = async (req, res) => {
  try {
    // ensure auth middleware populated req.user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const requesterId = String(req.user.id);
    const requesterRole = (req.user.role || '').toLowerCase();
    const targetId = req.params.id;
    if (!targetId) return res.status(400).json({ message: 'Missing target alumni id' });

    // enforce owner-only (no admin override)
    if (!(requesterRole === 'alumni' && requesterId === String(targetId))) {
      return res.status(403).json({ message: 'Forbidden: you can only update your own alumni profile' });
    }

    const data = { ...(req.body || {}) };

    // handle uploaded files (multer-style req.files)
    if (req.files) {
      if (req.files.profile_photo_url && req.files.profile_photo_url.length > 0) {
        data.profile_photo_url = '/uploads/' + req.files.profile_photo_url[0].filename;
      }
      if (req.files.verificationFile && req.files.verificationFile.length > 0) {
        data.verificationFile = '/uploads/' + req.files.verificationFile[0].filename;
      }
    }

    // Normalize array fields (accept JSON string or comma-separated)
    ['skills', 'contribution_preferences', 'preferred_communication'].forEach(field => {
      if (data[field] !== undefined) {
        if (typeof data[field] === 'string') {
          try {
            const parsed = JSON.parse(data[field]);
            data[field] = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            data[field] = data[field].split(',').map(s => s.trim()).filter(Boolean);
          }
        } else if (!Array.isArray(data[field])) {
          data[field] = [data[field]];
        }
      }
    });

    // Numeric normalization
    if (data.years_of_experience !== undefined) {
      const n = Number(data.years_of_experience);
      if (!Number.isNaN(n)) data.years_of_experience = n;
      else delete data.years_of_experience;
    }
    if (data.graduation_year !== undefined) {
      const n = Number(data.graduation_year);
      if (!Number.isNaN(n)) data.graduation_year = n;
      else delete data.graduation_year;
    }

    // If password included, hash it (owner-only)
    if (data.password) {
      data.password = await bcrypt.hash(String(data.password), 10);
    }

    // Prevent alumni from changing admin-only fields
    if ('is_verified' in data) {
      return res.status(403).json({ message: 'Only admin can change verification status' });
    }
    if ('engagement_status' in data || 'prospect_type' in data) {
      // silently drop or return error; here return error for transparency
      return res.status(403).json({ message: 'Not allowed to change this field' });
    }

    // Allowed fields the alumni owner may update
    const ALLOWED_FIELDS = [
      'college_id',
      'full_name',
      'contact_number',
      'linkedin_url',
      'github_url',
      'leetcode_url',
      'current_position',
      'company',
      'industry',
      'location',
      'years_of_experience',
      'skills',
      'profile_photo_url',
      'about_me',
      'professional_achievements',
      'contribution_preferences',
      'preferred_communication',
      'verificationFile',
      'portfolio',
      'twitter',
      'password',
      'degree',
      'graduation_year'
    ];

    const updatePayload = {};
    Object.keys(data).forEach(key => {
      if (ALLOWED_FIELDS.includes(key)) {
        updatePayload[key] = data[key];
      }
    });

    const updated = await AlumniProfile.findByIdAndUpdate(
      targetId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ message: 'Alumni not found' });

    return res.json({ message: 'Alumni profile updated successfully', alumni: updated });
  } catch (error) {
    console.error('Error updating alumni:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
