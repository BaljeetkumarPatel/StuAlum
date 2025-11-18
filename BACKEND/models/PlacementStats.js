const mongoose = require("mongoose");

const PlacementStatsSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true, unique: true },

    // Summary Numbers
    total_students: { type: Number, required: true },
    total_eligible: { type: Number, required: true },
    total_placed: { type: Number, required: true },
    higher_studies: { type: Number, default: 0 },
    avg_ctc: { type: Number, default: 0 },

    // NEW 🔹 For richer CTC insights (like your screenshots)
    highest_ctc: { type: Number, default: 0 },
    median_ctc: { type: Number, default: 0 },

    // Branch Statistics
    branches: [
      {
        name: { type: String },
        eligible: Number,
        placed: Number,
        higher_studies: Number,
        avg_ctc: Number,
        highest_ctc: Number,
        lowest_ctc: Number,
      },
    ],

    // Company Data
    companies: [
      {
        name: String,
        total_hires: Number,
        avg_ctc: Number,
        branches: Object, // e.g., {CSE: 20, ECE: 15, ME: 5}
      },
    ],

    // NEW 🔹 Internship Status (for internship cards)
    internships: {
      total_internships: { type: Number, default: 0 },
      paid_internships: { type: Number, default: 0 },
      min_stipend: { type: Number, default: 0 },
      max_stipend: { type: Number, default: 0 },
    },

    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminProfile",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlacementStats", PlacementStatsSchema);
