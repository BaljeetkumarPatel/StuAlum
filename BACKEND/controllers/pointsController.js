// controllers/pointsController.js
const Points = require("../models/Points");
const Event = require("../models/Event");
const { awardUniquePoints } = require("../utils/pointsHelper");

// small helper mapping
const mapRoleToType = (role) => {
  if (!role) return "StudentProfile";
  const r = String(role).toLowerCase();
  if (r === "student") return "StudentProfile";
  if (r === "alumni") return "AlumniProfile";
  return "StudentProfile";
};

// ----------------------------
// GET USER POINTS
// ----------------------------
exports.getUserPoints = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "Missing userId param." });

    // return Points doc (create if missing)
    let record = await Points.findOne({ userId });
    if (!record) {
      record = new Points({
        userId,
        userType: "StudentProfile",
        totalPoints: 0,
        badges: [],
      });
      await record.save();
    }

    // Return totals & badges (no recalculation here — since we award in event flows)
    return res.status(200).json({
      totalPoints: record.totalPoints || 0,
      badges: record.badges || [],
    });
  } catch (error) {
    console.error(" Error fetching user points:", error);
    res.status(500).json({ message: "Failed to fetch user points" });
  }
};

// ----------------------------
// LEADERBOARD (filtered by userType)
// ----------------------------
exports.getLeaderboard = async (req, res) => {
  try {
    const { userType } = req.query; // Student | Alumni

    // Map frontend → backend model names
    const mapping = {
      Student: "StudentProfile",
      Alumni: "AlumniProfile",
    };

    const mapped = mapping[userType];
    if (!mapped) return res.json([]);

    const topUsers = await Points.find({ userType: mapped })
      .populate("userId", "full_name email")
      .sort({ totalPoints: -1 })
      .limit(10);

    // const leaderboard = topUsers.map((entry) => ({
    //   id: entry.userId?._id || entry._id,
    //   full_name: entry.userId?.full_name || "Unknown",
    //   points: entry.totalPoints || 0,
    // }));

    const leaderboard = topUsers.map((entry) => ({
      id: entry.userId?._id || entry._id,
      full_name: entry.userId?.full_name || null,
      name: entry.userId?.name || null,
      email: entry.userId?.email || null,   // ← ADD THIS LINE
      points: entry.totalPoints || 0,
      userType: entry.userType || null
    }));



    return res.status(200).json(leaderboard);

  } catch (error) {
    console.error(" Error fetching leaderboard:", error);
    return res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};




// ----------------------------
// AWARD POINTS / BADGES (manual endpoint if needed)
// ----------------------------
exports.awardPoints = async (req, res) => {
  try {
    let { userId, userType, pointsToAdd, badge, actionKey } = req.body;

    if (!userId || !userType || !pointsToAdd) {
      return res.status(400).json({ message: "userId, userType and pointsToAdd are required." });
    }

    const mappedType = mapRoleToType(userType);

    // If actionKey provided, use awardUniquePoints to prevent duplicates
    if (actionKey) {
      await awardUniquePoints(userId, mappedType, Number(pointsToAdd), actionKey);
      const updated = await Points.findOne({ userId });
      return res.status(200).json({ message: "Awarded (unique) points", data: updated });
    }

    // Otherwise simple add (non-idempotent)
    let record = await Points.findOne({ userId });
    if (!record) {
      record = new Points({ userId, userType: mappedType, totalPoints: 0, badges: [] });
    }
    record.totalPoints += Number(pointsToAdd) || 0;

    if (badge) {
      record.badges.push({
        name: badge.name,
        description: badge.description || "",
        icon: badge.icon || "",
      });
    }

    await record.save();
    res.status(200).json({ message: "Points or badge awarded successfully", data: record });
  } catch (error) {
    console.error(" Error awarding points:", error);
    res.status(500).json({ message: "Failed to award points" });
  }
};


// -----------------------------------------------------
// ⭐ ADMIN: GET USER INFO FOR LEADERBOARD CLICK
// -----------------------------------------------------
exports.getUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    let { type } = req.query;

    if (!id || !type) {
      return res.status(400).json({ message: "Missing id or type." });
    }

    // Normalize type (Student → StudentProfile)
    const typeMap = {
      Student: "StudentProfile",
      Alumni: "AlumniProfile",
      StudentProfile: "StudentProfile",
      AlumniProfile: "AlumniProfile",
    };

    type = typeMap[type];

    if (!type) {
      return res.status(400).json({ message: "Invalid type provided." });
    }

    // Dynamically pick model
    const Model =
      type === "StudentProfile"
        ? require("../models/StudentProfile")
        : require("../models/AlumniProfile");

    const user = await Model.findById(id)
      .select("full_name email contact_number");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      full_name: user.full_name || "Unknown",
      email: user.email || "No email",
      phone: user.contact_number || "No phone",
    });

  } catch (err) {
    console.error(" getUserInfo error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

