const ChatHistory = require('../models/ChatHistory');

const MAX_HISTORY_MESSAGES = 50; // C1: trim to last 50 messages

async function loadHistoryForUser(userId) {
  const hist = await ChatHistory.findOne({ user_id: userId }).lean();
  return hist || null;
}

async function appendMessage(userId, role, sender, text) {
  // create if not exists, push, trim to MAX_HISTORY_MESSAGES
  const now = new Date();
  const update = {
    $push: { messages: { sender, text, timestamp: now } },
    $set: { updated_at: now, role }
  };
  const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
  const doc = await ChatHistory.findOneAndUpdate({ user_id: userId }, update, opts);

  // trim if longer
  if (doc.messages.length > MAX_HISTORY_MESSAGES) {
    const trimmed = doc.messages.slice(-MAX_HISTORY_MESSAGES);
    doc.messages = trimmed;
    doc.updated_at = new Date();
    await doc.save();
  }
}

async function getLastNMessagesForPrompt(userId, n = 20) {
  // return last n messages (most recent first -> we'll return in chronological order)
  const doc = await ChatHistory.findOne({ user_id: userId }).lean();
  if (!doc || !doc.messages || doc.messages.length === 0) return [];
  const slice = doc.messages.slice(-n);
  // convert to a simple array of {role, text, timestamp}
  return slice.map(m => ({ sender: m.sender, text: m.text, timestamp: m.timestamp }));
}

module.exports = {
  loadHistoryForUser,
  appendMessage,
  getLastNMessagesForPrompt
};
