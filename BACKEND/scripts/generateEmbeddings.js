const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const AlumniProfile = require("../models/AlumniProfile");
const StudentProfile = require("../models/StudentProfile");
const { createEmbedding } = require("../utils/aiService");

// Load .env safely (works even when running from /scripts)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Connect to MongoDB
(async () => {
  try {
    await connectDB();
    console.log(" Starting AI Embedding Migration (Gemini 2.5 Flash)");


    const alumniWithoutEmbeddings = await AlumniProfile.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } },
        { embedding: null },
      ],
    });

    if (alumniWithoutEmbeddings.length === 0) {
      console.log(" All alumni already have embeddings.\n");
    } else {
      console.log(` Found ${alumniWithoutEmbeddings.length} alumni missing embeddings.`);
      for (const alum of alumniWithoutEmbeddings) {
        try {
          const text = `
            Name: ${alum.full_name}
            Company: ${alum.company || ""}
            Industry: ${alum.industry || ""}
            Skills: ${(alum.skills || []).join(", ")}
            Experience: ${alum.years_of_experience || "N/A"}
          `;

          alum.embedding = await createEmbedding(text);
          await alum.save();
          console.log(` Embedded Alumni: ${alum.full_name}`);
        } catch (err) {
          console.error(` Failed to embed alumni ${alum.full_name}:`, err.message);
        }
      }
      console.log("\n Alumni embeddings update complete.\n");
    }

    const studentsWithoutEmbeddings = await StudentProfile.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } },
        { embedding: null },
      ],
    });

    if (studentsWithoutEmbeddings.length === 0) {
      console.log(" All students already have embeddings.\n");
    } else {
      console.log(` Found ${studentsWithoutEmbeddings.length} students missing embeddings.`);
      for (const stu of studentsWithoutEmbeddings) {
        try {
          const text = `
            Name: ${stu.full_name}
            Branch: ${stu.branch || ""}
            Skills: ${(stu.skills || []).join(", ")}
            Career Goals: ${stu.career_goals || ""}
            Mentorship Area: ${stu.mentorship_area || ""}
          `;

          stu.embedding = await createEmbedding(text);
          await stu.save();
          console.log(`Embedded Student: ${stu.full_name}`);
        } catch (err) {
          console.error(` Failed to embed student ${stu.full_name}:`, err.message);
        }
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(" Migration failed:", err);
    process.exit(1);
  }
})();
