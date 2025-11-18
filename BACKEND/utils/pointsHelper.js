const Points = require("../models/Points");
const PointAward = require("../models/PointAward");

async function awardUniquePoints(userId, userType, points, actionKey) {
  if (!userId || !userType || !points || !actionKey) return;

  try {
    // Try to create a PointAward document; unique index prevents duplicates.
    const award = new PointAward({
      userId,
      actionKey,
      points,
    });

    await award.save(); // will throw if duplicate (unique index)

    // increment or create Points record
    const updated = await Points.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: { userId, userType, badges: [] },
        $inc: { totalPoints: Number(points) },
      },
      { upsert: true, new: true }
    );

    console.log(` awardUniquePoints: gave ${points} pts to ${userId} for ${actionKey}`);
    return updated;
  } catch (err) {
    // Duplicate key => someone already awarded this action. ignore.
    if (err && err.code === 11000) {
      // Already awarded
      //console.log(` awardUniquePoints: already awarded ${actionKey} for ${userId}`);
      return null;
    }
    console.error(" awardUniquePoints error:", err);
    throw err;
  }
}

module.exports = { awardUniquePoints };
