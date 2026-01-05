// // utils/chatbotAI.js
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// /* ----------------------------------------------------------
//    1) INTENT CLASSIFIER → returns structured JSON
// ----------------------------------------------------------- */


// async function classifyIntent(message) {
//   try {
//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.5-flash", 
//     });

//     const prompt = `
// You are an intent classifier for a Student–Alumni–Admin Platform chatbot.
// Return ONLY valid JSON. No text outside JSON.

// Possible intents:
// - "general"
// - "db_lookup"
// - "career_predict"
// - "faq"
// - "action"

// Possible actions:
// - "register_event"
// - "create_mentorship_request"
// - "start_resume_review"

// Infer resources such as:
// - "my_profile"
// - "events"
// - "faqs"
// - "prep_resources"
// - "find_alumni"
// - "mentorship_matches"
// - "career_articles"

// Extract any IDs (event ID, mentor ID), skills, companies, or filters.

// User message:
// ${message}

// Return JSON:
// {
//   "type": "",
//   "resource": "",
//   "action": "",
//   "payload": {},
//   "filters": {}
// }
// `;

//     const result = await model.generateContent({
//       contents: [{ role: "user", parts: [{ text: prompt }] }],
//     });

//     const text = result.response.text().trim();

//     try {
//       return JSON.parse(text);
//     } catch (err) {
//       console.warn("⚠ Intent JSON Parse FAILED. Fallback → general");
//       return { type: "general" };
//     }
//   } catch (error) {
//     console.warn("Intent classify error:", error.message);
//     return { type: "general" };
//   }
// }

// /* ----------------------------------------------------------
//    2) CHATBOT — DB-AWARE RESPONSE
// ----------------------------------------------------------- */
// async function generateChatResponse({ systemPrompt, userMessage }) {
//   try {
//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.5-flash", // fast + reasoning optimised
//     });

//     const prompt = `
// System:
// ${systemPrompt}

// User:
// ${userMessage}
// `;

//     const result = await model.generateContent({
//       contents: [{ role: "user", parts: [{ text: prompt }] }],
//     });

//     return result.response.text();
//   } catch (err) {
//     console.error("Chat Response Error:", err.message);
//     return "I'm sorry, I couldn't generate a response. Try again.";
//   }
// }

// /* ----------------------------------------------------------
//    3) Build system prompt (DB + role-aware)
// ----------------------------------------------------------- */
// function buildSystemPrompt({ role, dbData }) {
//   const summaryParts = [];

//   if (dbData?.profile) {
//     const p = dbData.profile;
//     summaryParts.push(
//       `UserProfile: ${p.full_name}, role=${role}, skills=${(p.skills || []).join(", ")}`
//     );
//   }

//   if (dbData?.events) {
//     summaryParts.push(
//       `UpcomingEvents: ${dbData.events
//         .slice(0, 5)
//         .map((e) => e.title)
//         .join(", ")}`
//     );
//   }

//   if (dbData?.alumni) {
//     summaryParts.push(
//       `MatchedAlumni: ${dbData.alumni
//         .slice(0, 5)
//         .map((a) => `${a.full_name} (${a.company})`)
//         .join(", ")}`
//     );
//   }

//   if (dbData?.faqs) {
//     summaryParts.push(
//       `FAQs: ${dbData.faqs.slice(0, 4).map((f) => f.question).join(", ")}`
//     );
//   }

//   if (dbData?.articles) {
//     summaryParts.push(
//       `CareerArticles: ${dbData.articles
//         .slice(0, 4)
//         .map((a) => a.title)
//         .join(", ")}`
//     );
//   }

//   return `
// You are "StuAlum AI", the official chatbot for a Student–Alumni–Admin platform.
// You MUST use platform data when available.

// User role: ${role}

// Relevant DB Data:
// ${summaryParts.join(" | ") || "No relevant DB data."}

// Rules:
// - Be helpful and give step-by-step guidance.
// - For student: focus on career, mentorship, events.
// - For alumni: focus on mentoring & contributions.
// - For admin: provide dashboard assistance.
// - Keep responses short and actionable.
// `;
// }

// module.exports = {
//   classifyIntent,
//   generateChatResponse,
//   buildSystemPrompt,
// };


const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ----------------------------------------------------------
   Helper: Call model with fallback (2.5 → 2.0)
----------------------------------------------------------- */
async function callGemini(modelName, prompt) {
  const primaryModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await primaryModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    return result.response.text();
  } catch (err) {
    console.warn(" Primary model failed:", err.message);
    console.warn(" Switching to fallback model (gemini-2.5-flash)...");

    try {
      const result = await fallbackModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      return result.response.text();
    } catch (e) {
      console.error(" Fallback model failed:", e.message);
      return null;
    }
  }
}

/* ----------------------------------------------------------
   1) INTENT CLASSIFIER (JSON)
----------------------------------------------------------- */
async function classifyIntent(message) {
  const prompt = `
You are an intent classifier for a Student–Alumni–Admin Platform chatbot.
Return ONLY valid JSON. No text outside JSON.

---
Detect if the user is asking for PLACEMENT ANALYTICS.
If message contains keywords like:
"placement", "analytics", "placement stats", "placement report",
then return:

{
  "type": "db_lookup",
  "resource": "placement_analytics",
  "action": "",
  "payload": {},
  "filters": {}
}

2️ APPLY AS SPEAKER (ACTION)
If user says anything like:
"I want to speak at events"
"I want to be a speaker"
"I want to give a talk"
"I want to deliver a seminar"
"I want to deliver a session"
Return EXACTLY:
{
  "type": "action",
  "resource": "",
  "action": "apply_speaker",
  "payload": {},
  "filters": {}
}

---------------------------------------
3️ GENERAL MENTORING INTENT (NOT AN ACTION)
If user says:
"I want to mentor students"
"I want to guide students"
"I want to help juniors"
"I want to support students"
Then DO NOT create mentorship request.

Return EXACTLY:
{
  "type": "general",
  "resource": "",
  "action": "",
  "payload": {},
  "filters": {}
}

---------------------------------------
4️ SPECIFIC MENTOR ACTION
If message contains:
"mentor <studentId>"
"help student <id>"
"guide student <id>"
Extract studentId and return:

{
  "type": "action",
  "resource": "",
  "action": "create_mentorship_request",
  "payload": { "studentId": "<ID>" },
  "filters": {}
}
---

Other possible intents:
- "general"
- "db_lookup"
- "career_predict"
- "faq"
- "action"


Possible actions:
- "register_event"
- "create_mentorship_request"
- "start_resume_review"
- "apply_speaker"

Infer resources such as:
- "my_profile"
- "events"
- "faqs"
- "prep_resources"
- "find_alumni"
- "mentorship_matches"
- "career_articles"
- "placement_analytics"

Extract any IDs (event ID, mentor ID), skills, companies, or filters.

User message:
${message}

Return JSON:
{
  "type": "",
  "resource": "",
  "action": "",
  "payload": {},
  "filters": {}
}
`;

  let text = await callGemini("intent", prompt);

  if (!text) return { type: "general" };

  // Remove ```json blocks
  text = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(text);
  } catch (err) {
    console.warn("⚠ Intent JSON Parse FAILED.");
    return { type: "general" };
  }
}

// /* ----------------------------------------------------------
//    2) CHATBOT — DB-AWARE RESPONSE
// ----------------------------------------------------------- */
async function generateChatResponse({ systemPrompt, userMessage }) {
  const prompt = `
System:
${systemPrompt}

User:
${userMessage}
  `;

  const response = await callGemini("chat", prompt);

  if (!response) return "I'm facing issues. Try again shortly.";

  return response;
}



/* ----------------------------------------------------------
   3) Build system prompt
----------------------------------------------------------- */
function buildSystemPrompt({ role, dbData }) {
  const summaryParts = [];

  if (dbData?.profile) {
    const p = dbData.profile;
    summaryParts.push(
      `UserProfile: ${p.full_name}, role=${role}, skills=${(p.skills || []).join(", ")}`
    );
  }

  if (dbData?.events) {
    summaryParts.push(
      `UpcomingEvents: ${dbData.events
        .slice(0, 5)
        .map((e) => e.title)
        .join(", ")}`
    );
  }

  if (dbData?.alumni) {
    summaryParts.push(
      `MatchedAlumni: ${dbData.alumni
        .slice(0, 5)
        .map((a) => `${a.full_name} (${a.company})`)
        .join(", ")}`
    );
  }

  if (dbData?.faqs) {
    summaryParts.push(
      `FAQs: ${dbData.faqs.slice(0, 4).map((f) => f.question).join(", ")}`
    );
  }

  if (dbData?.articles) {
    summaryParts.push(
      `CareerArticles: ${dbData.articles
        .slice(0, 4)
        .map((a) => a.title)
        .join(", ")}`
    );
  }

  return `
You are "StuAlum AI", the official chatbot.
Use DB data when available.

User role: ${role}

Relevant data:
${summaryParts.join(" | ") || "No DB data."}

Rules:
- Student → career help, mentorship, resume.
- Alumni → guide students, events.
- Admin → analytics, user management.
- Be short, clear, structured.
`;
}

module.exports = {
  classifyIntent,
  generateChatResponse,
  buildSystemPrompt,
};
