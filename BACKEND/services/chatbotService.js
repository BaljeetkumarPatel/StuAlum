const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const Event = require('../models/Event');
const MentorshipRequest = require('../models/MentorshipRequest');
const MentorshipMatch = require('../models/MentorshipMatch');
const ResumeReviewSession = require('../models/ResumeReviewSession');
const PrepResource = require('../models/PrepResource');
const FAQ = require('../models/FAQ');
const CareerArticleVideo = require('../models/CareerArticleVideo');
const Points = require('../models/Points');
const PlacementStats = require("../models/PlacementStats");


const { classifyIntent, buildSystemPrompt, generateChatResponse } = require('../utils/chatbotAI');
const { appendMessage, getLastNMessagesForPrompt } = require('./chatHistoryService');

const mongoose = require('mongoose');

async function findAlumniByFilters(filters = {}, top = 10) {
  const q = {};
  if (filters.company) q.company = new RegExp(filters.company, 'i');
  if (filters.skills?.length) q.skills = { $in: filters.skills };
  if (filters.location) q.location = new RegExp(filters.location, 'i');

  let candidates = await AlumniProfile.find(q).limit(100).lean();
  return candidates.slice(0, top);
}

async function performAction(action, payload, userId, role) {
  switch (action) {
    case 'apply_speaker':
        if (role !== "alumni") {
          return { success: false, message: "Only alumni can apply to speak at events." };
        }

        return { success: true, message: "You have been added to the speakers list. The admin will contact you soon." };
    case 'register_event': {
      const { eventId } = payload;
      const ev = await Event.findById(eventId);
      if (!ev) throw new Error('Event not found');

      const modelType = role === 'alumni' ? 'AlumniProfile' : 'StudentProfile';
      ev.registered_users = ev.registered_users || [];
      ev.registered_users.push({ user_id: mongoose.Types.ObjectId(userId), registered_at: new Date() });
      ev.registered_count = (ev.registered_count || 0) + 1;
      await ev.save();

      try {
        await Points.findOneAndUpdate({ userId, userType: modelType }, { $inc: { totalPoints: 5 }}, { upsert: true });
      } catch (e) { console.warn('points update failed', e.message); }

      return { success: true, message: `Registered to event "${ev.title}"` };
    }

   case 'create_mentorship_request': {
  // Admin is not allowed to use this action
  if (role === "admin") {
    return {
      success: false,
      message: "Admins cannot create mentorship requests."
    };
  }

  // STUDENT → “Find mentor” should NOT create request automatically
  if (role === "student") {
    return {
      success: false,
      message: "To connect with a mentor, please browse alumni profiles and choose a mentor manually."
    };
  }

  // ALUMNI → Valid
  if (role === "alumni") {
        const { studentId } = payload || {};

        if (!studentId) {
          return {
            success: false,
            message: "Specify a student to mentor."
          };
        }

        const mr = new MentorshipRequest({
          mentor_id: userId,
          mentee_id: studentId
        });

        await mr.save();

        return {
          success: true,
          message: "You have successfully offered mentorship to the student."
        };
      }

      return { success: false, message: "Invalid role." };
    }

    case 'start_resume_review': {
      const { resumePath, originalFilename } = payload;
      const session = new ResumeReviewSession({
        user_id: userId,
        user_model_type: role === 'alumni' ? 'AlumniProfile' : 'StudentProfile',
        resume_path: resumePath,
        original_filename: originalFilename,
        status: 'Started',
        initial_analysis: 'Queued for AI review'
      });
      await session.save();
      return { success: true, message: 'Resume review started', sessionId: session._id };
    }

    default:
      return { success: false, message: 'Unknown action' };
  }
}

async function handleChatQuery({ message, userId, role }) {
  if (!userId) throw new Error('Authentication required');

  // 1) append user's message to hidden history
  await appendMessage(userId, role, 'user', message);

  // 2) classify intent (fast)
  const intent = await classifyIntent(message);

  // 3) if action, perform it (actions also saved to history inside this flow)
  if (intent.type === 'action') {
    const actionResult = await performAction(intent.action, intent.payload || {}, userId, role);
    // Save action result as bot message
    const botText = `Action result: ${actionResult.message || JSON.stringify(actionResult)}`;
    await appendMessage(userId, role, 'bot', botText);
    return { intent: intent.type, reply: botText, actionResult };
  }

  // 4) prepare DB data if needed
  let dbData = {};
  if (intent.type === 'db_lookup') {
    if (intent.resource === "placement_analytics") {
      const stats = await PlacementStats.findOne().sort({ year: -1 }).lean();

      if (!stats) {
        return {
          intent: "db_lookup",
          reply: "No placement analytics available yet.",
          type: "text",
          data: null
        };
      }

      return {
        intent: "db_lookup",
        reply: "Here are the latest placement analytics:",
        type: "placement_analytics",
        data: stats
      };
    }
    if (intent.resource === 'my_profile') {
      dbData.profile = role === 'student' ? await StudentProfile.findById(userId).lean() : await AlumniProfile.findById(userId).lean();
    } else if (intent.resource === 'find_alumni') {
      dbData.alumni = await findAlumniByFilters(intent.filters || {}, 10);
    } else if (intent.resource === 'events') {
      dbData.events = await Event.find({ start_time: { $gte: new Date() }, status: 'scheduled' }).sort({ start_time: 1 }).limit(10).lean();
    } else if (intent.resource === 'mentorship_matches') {
      dbData.matches = await MentorshipMatch.find({ mentee_id: userId }).populate('mentor_id').lean();
    } else if (intent.resource === 'faqs') {
      dbData.faqs = await FAQ.find({ is_active: true }).limit(10).lean();
    } else if (intent.resource === 'prep_resources') {
      dbData.resources = await PrepResource.find({ category: 'prep' }).limit(10).lean();
    } else if (intent.resource === 'career_articles') {
      dbData.articles = await CareerArticleVideo.find({}).sort({ createdAt: -1 }).limit(10).lean();
    }

  }

  // 5) load recent chat history for LLM context (last 20)
  const recentHistory = await getLastNMessagesForPrompt(userId, 20);

  // 6) Build system prompt (includes role, dbData, and recentHistory)
  const systemPrompt = buildSystemPrompt({ role, dbData });
  // Add concise history text to userMessage for LLM context
  const historyText = recentHistory.map(m => `${m.sender === 'user' ? 'User' : 'Bot'}: ${m.text}`).join('\n');

  const userMessageForLLM = `Recent conversation:\n${historyText}\n\nCurrent user message:\n${message}`;

  // 7) Call LLM
  const llmReply = await generateChatResponse({ systemPrompt, userMessage: userMessageForLLM });

  // 8) Save bot reply to history (hidden)
  await appendMessage(userId, role, 'bot', llmReply);

  return { intent: intent.type, dbData, reply: llmReply };
}



module.exports = {
  handleChatQuery,
  performAction
};
