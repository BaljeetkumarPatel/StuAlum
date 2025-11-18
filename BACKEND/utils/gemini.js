// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// exports.generateWithGemini = async (prompt) => {
//     if (!genAI) throw new Error('Gemini API not configured');

//     const model = genAI.getGenerativeModel({
//         model: 'gemini-2.0-flash',
//         generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
//     });

//     const result = await model.generateContent(prompt);
//     const text = (await result.response).text();
//     return text;
// };

// gemini.js


const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

//  Load API Key safely
const apiKey = process.env.GEMINI_API_KEY;

//  Optional fallback (for local testing)
if (!apiKey) {
  console.warn(" GEMINI_API_KEY missing in .env — using dummy response mode.");
}

// Initialize Gemini only if API key exists
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Default model configuration
const defaultModel = "gemini-2.0-flash";
const defaultConfig = {
  temperature: 0.7,
  maxOutputTokens: 2048,
};

const generateWithGemini = async (prompt) => {
  if (!genAI) {
    console.log(" Returning dummy output (Gemini API not configured).");
    return `Dummy Gemini output for prompt: "${prompt}"`;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: defaultModel,
      generationConfig: defaultConfig,
    });

    const result = await model.generateContent(prompt);

    const text =
      (result.response && result.response.text && result.response.text()) ||
      (result.response?.candidates?.[0]?.content?.parts?.[0]?.text) ||
      " No valid text found in Gemini response.";

    return text;
  } catch (error) {
    console.error(" Gemini API Error:", error);
    throw new Error("Failed to generate content from Gemini API");
  }
};

// ======================
// 🔹 Specialized Generator (Event Planning)
// ======================

const getGeminiEventPlan = async (prompt) => {
  console.log(" Generating event plan with Gemini...");
  return await generateWithGemini(prompt);
};

module.exports = {
  generateWithGemini,
  getGeminiEventPlan,
};



// import dotenv from "dotenv";

// dotenv.config();
// const apiKey = process.env.GEMINI_API_KEY;
// if (!apiKey) {
//   throw new Error(" Missing GEMINI_API_KEY in .env");
// }

// const genAI = new GoogleGenerativeAI(apiKey);

// export const getGeminiEventPlan = async (prompt) => {
//   try {
//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.0-flash", // safer model name (works with current SDK)
//       generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
//     });

//     const result = await model.generateContent(prompt);
//     console.log(" Gemini API raw response:", JSON.stringify(result, null, 2));

//     const text =
//       result.response?.text?.() ||
//       result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
//       " No valid text found in Gemini response.";

//     return text;
//   } catch (error) {
//     console.error(" Gemini API error:", error);
//     throw new Error("Failed to generate content from Gemini API");
//   }
// };
