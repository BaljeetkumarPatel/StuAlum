// BACKEND/services/resumeProcessor.js
const fs = require('fs');
const path = require('path');

// ⭐ FIX: pdf-parse v2.4.5 (ESM) requires dynamic import
const pdf = require("pdf-parse");

const ResumeReviewSession = require('../models/ResumeReviewSession');
const { appendMessage } = require('../services/chatHistoryService');
const { generateReasoning } = require('../utils/aiService');

const SIMULATED_DELAY_SECONDS = 2;

// ⭐ FIX: PDF Extract Function (MUST EXIST)
async function extractTextFromPdf(filePath) {
  try {
    const pdfBuffer = fs.readFileSync(filePath);

    // pdf-parse v2.4.5 supports direct calling
    const data = await pdf(pdfBuffer);

    return data.text || "";
  } catch (err) {
    console.error("extractTextFromPdf error:", err);
    throw err;
  }
}


function buildResumePrompt(extractedText) {
  return `
You are an expert ATS evaluator and senior hiring manager.
Provide a clean, highly readable, structured resume evaluation with NO emojis,
NO decorative borders, and NO long paragraphs.

STRICT FORMAT (MUST FOLLOW EXACTLY):

===========================================================

Resume Review Summary
- ATS Score (0–10): X/10
- 1–2 line justification

------------------------------------------------------------

Overall Impression
Short 2–3 sentences describing overall profile and readiness.

------------------------------------------------------------

Top Strengths
- 5 bullet points only
- Short, clear, meaningful

------------------------------------------------------------

Weak Areas
- 5 bullet points only
- Must be honest but helpful

------------------------------------------------------------

Actionable Improvements (Do These)
1. Improvement
2. Improvement
3. Improvement
4. Improvement
5. Improvement
6. Improvement

------------------------------------------------------------

Skills Detected
Technical: skill1, skill2, skill3
Soft Skills: skill1, skill2, skill3

------------------------------------------------------------

Education Review
2–3 lines describing strengths and concerns.

------------------------------------------------------------

Experience Review
2–3 lines describing strengths and concerns.

------------------------------------------------------------

Best Fit Job Roles
- Role 1
- Role 2
- Role 3

------------------------------------------------------------

Missing Keywords (ATS Optimization)
- keyword
- keyword
- keyword
- keyword
- keyword

===========================================================

RULES:
- ABSOLUTELY NO emojis.
- Keep sections short and readable.
- Use clean bullet points.
- No decorative formatting.
- No extra sections beyond what is listed.
- Format exactly as shown.
===========================================================

RESUME:
${extractedText}
  `;
}


async function processResume(sessionId) {
  try {
    const session = await ResumeReviewSession.findById(sessionId).lean();
    if (!session) return;

    if (["Processing", "Ready", "Failed", "Closed"].includes(session.status)) {
      return;
    }

    await ResumeReviewSession.findByIdAndUpdate(sessionId, {
      status: "Processing"
    });

    if (SIMULATED_DELAY_SECONDS > 0) {
      await new Promise(res => setTimeout(res, SIMULATED_DELAY_SECONDS * 1000));
    }

    const resumePath = session.resume_path;
    if (!resumePath || !fs.existsSync(resumePath)) {
      await ResumeReviewSession.findByIdAndUpdate(sessionId, {
        status: "Failed",
        initial_analysis: "Resume file not found."
      });
      return;
    }

    let extractedText = "";
    try {
      extractedText = await extractTextFromPdf(resumePath);
    } catch (err) {
      console.error("PDF parse failed:", err);
      await ResumeReviewSession.findByIdAndUpdate(sessionId, {
        status: "Failed",
        initial_analysis: "Failed to parse PDF."
      });
      return;
    }

    const prompt = buildResumePrompt(extractedText);
    let aiReply = "";

    try {
      aiReply = await generateReasoning(prompt);
    } catch (err) {
      console.error("AI reasoning failed:", err);
      aiReply = "Resume review unavailable due to an AI error.";
    }

    await ResumeReviewSession.findByIdAndUpdate(sessionId, {
      status: "Ready",
      initial_analysis: aiReply,
      reviewed_at: new Date()
    });

    try {
      const userId = session.user_id;
      const role = session.user_model_type === "AlumniProfile" ? "alumni" : "student";

      await appendMessage(
        userId,
        role,
        "bot",
        `Resume Review Completed:\n\n${aiReply}`
      );
    } catch (err) {
      console.warn("Failed to append resume review to chat history:", err.message);
    }

  } catch (err) {
    console.error("processResume error:", err);
    await ResumeReviewSession.findByIdAndUpdate(sessionId, { status: "Failed" });
  }
}

module.exports = { processResume };
