const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function createEmbedding(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "models/text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    console.error(" Embedding Error:", err.message);
    return Array.from({ length: 1536 }, () => Math.random());
  }
}

async function generateReasoning(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    return result.response.text();
  } catch (err) {
    console.error("Reasoning Error:", err.message);
    return "Reasoning unavailable.";
  }
}

module.exports = { createEmbedding, generateReasoning };
