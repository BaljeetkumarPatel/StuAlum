// backend/controllers/profileController.js
const bcrypt = require('bcryptjs');
const Student = require('../models/StudentProfile');
const Alumni = require('../models/AlumniProfile');
const Admin = require('../models/AdminProfile');

// Allowed fields per model (whitelist)
const STUDENT_ALLOWED = [
  'full_name','contact_number','address','skills','interests','career_goals',
  'preferences','photo','profile_photo_url','current_position','company',
  'linkedin','github','communication','projects'
];

const ALUMNI_ALLOWED = [
  'full_name','graduation_year','degree','current_position','company','industry',
  'location','professional_achievements','skills','linkedin_url','github_url',
  'leetcode_url','about_me','profile_photo_url','contact_number','years_of_experience',
  'preferred_communication','contribution_preferences','prospect_type'
];

const ADMIN_ALLOWED = [
  'full_name','designation','department','contact_office'
];

function pick(payload = {}, allowed = []) {
  const out = {};
  Object.keys(payload).forEach(key => {
    if (allowed.includes(key)) out[key] = payload[key];
  });
  return out;
}

async function hashPasswordIfPresent(payload) {
  if (!payload || !payload.password) return payload;
  const salt = await bcrypt.genSalt(10);
  return { ...payload, password: await bcrypt.hash(payload.password, salt) };
}

async function upsertAndRespond(Model, id, updateData, label, res) {
  const updated = await Model.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
    context: 'query'
  }).select('-password');
  if (!updated) return res.status(404).json({ message: `${label} not found.` });
  return res.json({ message: `${label} updated.`, data: updated });
}

exports.updateStudent = async (req, res) => {
  try {
    // ownership already checked by middleware
    const payload = pick(req.body, STUDENT_ALLOWED.concat(['password']));
    const finalPayload = await hashPasswordIfPresent(payload);
    return await upsertAndRespond(Student, req.params.id, finalPayload, 'Student', res);
  } catch (err) {
    console.error('updateStudent error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAlumni = async (req, res) => {
  try {
    const payload = pick(req.body, ALUMNI_ALLOWED.concat(['password']));
    const finalPayload = await hashPasswordIfPresent(payload);
    return await upsertAndRespond(Alumni, req.params.id, finalPayload, 'Alumni', res);
  } catch (err) {
    console.error('updateAlumni error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const payload = pick(req.body, ADMIN_ALLOWED.concat(['password']));
    const finalPayload = await hashPasswordIfPresent(payload);
    return await upsertAndRespond(Admin, req.params.id, finalPayload, 'Admin', res);
  } catch (err) {
    console.error('updateAdmin error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
