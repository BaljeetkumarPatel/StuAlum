const mongoose = require("mongoose");

const PointAwardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  actionKey: { // e.g. "event_register_<eventId>" or "event_created_<eventId>"
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

// ensure uniqueness: one user can't get same action twice
PointAwardSchema.index({ userId: 1, actionKey: 1 }, { unique: true });

module.exports = mongoose.model("PointAward", PointAwardSchema);
