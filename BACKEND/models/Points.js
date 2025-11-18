const mongoose = require("mongoose");

const PointsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "userType",
    required: true,
  },

  // Must match EXACT model names!
  userType: {
    type: String,
    enum: ["StudentProfile", "AlumniProfile"],
    required: true,
  },

  totalPoints: {
    type: Number,
    default: 0,
  },

  badges: [
    {
      name: String,
      description: String,
      icon: String,
      earnedAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Points", PointsSchema);
