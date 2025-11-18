const AlumniProfile = require("../models/AlumniProfile");
const StudentProfile = require("../models/StudentProfile");
const { createEmbedding, generateReasoning } = require("../utils/aiService");

/**
 * 🎓 AI Alumni Recommendation Controller
 * Generates top mentor matches using embeddings + hybrid scoring.
 * Case-insensitive, Gemini-integrated, and production safe.
 */
exports.generateRecommendations = async (req, res) => {
  try {
    const { studentId, manualData } = req.body;

    //  Fetch student data
    const student = studentId
      ? await StudentProfile.findById(studentId)
      : manualData;

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Normalize for case-insensitive processing
    student.branch = student.branch?.trim().toLowerCase() || "";
    student.skills = (student.skills || []).map((s) => s.toLowerCase().trim());
    student.career_goals = student.career_goals?.trim().toLowerCase() || "";
    student.mentorship_area =
      student.mentorship_area?.trim().toLowerCase() || "";

    // Create student embedding
    const studentText = `
      Branch: ${student.branch}
      Skills: ${student.skills.join(", ")}
      Career Goal: ${student.career_goals}
      Mentorship Area: ${student.mentorship_area}
    `;

    console.log(" Generating student embedding...");
    const studentEmbedding = await createEmbedding(studentText);

    if (!studentEmbedding?.length) {
      return res
        .status(500)
        .json({ message: "Failed to create embedding for student." });
    }

    //  Perform vector search on alumni embeddings
    console.log(" Running vector search on alumni profiles...");
    const candidates = await AlumniProfile.aggregate([
      {
        $vectorSearch: {
          index: "alumniprofiles",
          path: "embedding",
          queryVector: studentEmbedding,
          numCandidates: 100,
          limit: 20,
        },
      },
      {
        $project: {
          full_name: 1,
          company: 1,
          degree: 1,
          industry: 1,
          years_of_experience: 1,
          skills: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    if (!candidates.length) {
      console.warn("No alumni found in vector search.");
      return res.json({ recommendations: [] });
    }

    // Normalize alumni before hybrid scoring
    const hybridResults = candidates
      .map((alum) => {
        const exp = Math.min(alum.years_of_experience / 15 || 0, 1);
        const branch =
          student.branch === alum.degree?.toLowerCase() ? 1 : 0;
        const industry =
          alum.industry?.toLowerCase()?.includes(student.career_goals) || false
            ? 1
            : 0;

        const finalScore =
          0.55 * exp + 0.30 * alum.score + 0.10 * branch + 0.05 * industry;

        return { ...alum, finalScore };
      })
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 5);

    console.log(` Top ${hybridResults.length} alumni selected.`);

    // Generate reasoning with Gemini
    const prompt = hybridResults
      .map(
        (r, i) =>
          `Alumni ${i + 1}: ${r.full_name} (${r.company}) — ${
            r.years_of_experience
          } years exp.\nSkills: ${r.skills.join(", ")}\nStudent: ${(
            student.skills || []
          ).join(", ")}`
      )
      .join("\n\n");

    console.log(" Generating reasoning...");
    let reasoningText = "";
    try {
      reasoningText = await generateReasoning(
        `Explain briefly why each alumni could be a good mentor for the student.\n\n${prompt}`
      );
    } catch (e) {
      console.warn(" Reasoning generation failed:", e.message);
    }

    const reasonList =
      reasoningText
        ?.split(/\n|--|•/)
        ?.map((r) => r.trim())
        ?.filter((r) => r.length > 10) || [];

    // Format final response
    const response = hybridResults.map((a, i) => ({
      name: a.full_name,
      company: a.company || "N/A",
      experience: a.years_of_experience || 0,
      vector_score: a.score?.toFixed(3) || "0.000",
      hybrid_score: a.finalScore?.toFixed(3) || "0.000",
      reason:
        reasonList[i] ||
        `Alumni ${a.full_name} shares similar skills and experience aligned with the student’s goals.`,
    }));

    res.status(200).json({ recommendations: response });
  } catch (err) {
    console.error(" Error generating recommendations:", err);
    res.status(500).json({
      error:
        err.message ||
        "Internal Server Error while generating recommendations.",
    });
  }
};
