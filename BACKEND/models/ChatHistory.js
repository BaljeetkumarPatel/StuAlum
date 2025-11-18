const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'bot'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const ChatHistorySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, enum: ['student', 'alumni', 'admin'], required: true },
  messages: { type: [ChatMessageSchema], default: [] }, // stored chronologically
  updated_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
