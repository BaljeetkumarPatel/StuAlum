import Alumni from "../models/Alumni.js";
import { createEmbedding } from "../utils/aiService.js";

export async function updateMissingAlumniEmbeddings() {
  const alumni = await Alumni.find({
    $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }],
  });

  for (const alum of alumni) {
    const text = `
      ${alum.full_name}, ${alum.company}, ${alum.industry},
      ${alum.degree}, Skills: ${(alum.skills || []).join(", ")}.
      Achievements: ${alum.professional_achievements}.
    `;
    alum.embedding = await createEmbedding(text);
    await alum.save();
  }
  console.log(" Alumni embeddings updated.");
}
