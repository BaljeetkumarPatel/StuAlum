
const MentorshipPreference = require("../models/MentorshipPreference");
const MentorshipRequest = require("../models/MentorshipRequest");
const PlacementStats = require("../models/PlacementStats");
console.log(" Loaded PlacementStats model:", PlacementStats?.modelName || PlacementStats);


const uploadPlacementStats = async (req, res) => {
  try {
    const role = req.user.role;
    if (role !== "admin")
      return res.status(403).json({ error: "Only admin can upload placement data" });

    const {
      year,
      total_students,
      total_eligible,
      total_placed,
      higher_studies,
      median_ctc,
      avg_ctc,
      branches,
      companies,
      internships,
    } = req.body;

    const {
      total_internships,
      paid_internships,
      min_stipend,
      max_stipend
    } = internships || {};


    if (!year || !total_students)
      return res.status(400).json({ error: "Missing required fields" });

    const existing = await PlacementStats.findOne({ year });
    if (existing) {
      Object.assign(existing, {
        total_students,
        total_eligible,
        total_placed,
        higher_studies,
        median_ctc,
        avg_ctc,
        branches,
        companies,
        internships: {
          total_internships,
          paid_internships,
          min_stipend,
          max_stipend
        }
      });
      await existing.save();
      return res.json({
        message: "Placement data updated successfully",
        data: existing,
      });
    }

    const placement = await PlacementStats.create({
      year,
      total_students,
      total_eligible,
      total_placed,
      higher_studies,
      median_ctc,
      avg_ctc,
      branches,
      companies,
      internships: {
        total_internships,
        paid_internships,
        min_stipend,
        max_stipend,
      },
      uploaded_by: req.user.id,
    });

    res.status(201).json({
      message: " Placement data uploaded successfully",
      data: placement,
    });
  } catch (err) {
    console.error(" Upload Error:", err);
    res.status(500).json({ error: "Server Error Uploading Placement Data" });
  }
};


const getPlacementAnalytics = async (req, res) => {
  try {
    const stats = await PlacementStats.find().sort({ year: 1 });
    // if (!stats.length)
    //   return res.status(404).json({ message: "No placement data found" });
    res.json(stats);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ error: "Server Error Fetching Analytics" });
  }
};

const getDashboardStats = async (req, res) => {
  console.log(" Hit getDashboardStats controller");
  try {
        const role = req.user.role.toLowerCase();

        // Load related models
        const StudentProfile = require("../models/StudentProfile");
        const AlumniProfile = require("../models/AlumniProfile");
        const Event = require("../models/Event");
        const MentorshipRequest = require("../models/MentorshipRequest");

        if (role === "admin") {
          const [alumniCount, studentCount, eventCount, latestPlacement] =
            await Promise.all([
              AlumniProfile.countDocuments(),
              StudentProfile.countDocuments(),
              Event.countDocuments(),
              PlacementStats.findOne().sort({ year: -1 }),
            ]);

          let placementStats = [];
          if (latestPlacement) {
            const placementRate = (
              (latestPlacement.total_placed / latestPlacement.total_eligible) *
              100
            ).toFixed(1);

            placementStats = [
              {
                title: `Placement Year ${latestPlacement.year}`,
                value: `${placementRate}% Placement Rate`,
              },
              { title: "Average CTC", value: `${latestPlacement.avg_ctc} LPA` },
              { title: "Total Placed Students", value: latestPlacement.total_placed },
            ];
          }

          return res.json({
            role,
            stats: [
              { title: "Total Alumni Registered", value: alumniCount },
              { title: "Total Students Registered", value: studentCount },
              { title: "Total Events Created", value: eventCount },
              ...placementStats,
            ],
          });
        }

        if (role === "student") {
          const eventsRegistered = await Event.countDocuments({
            "registered_users.user_id": req.user.id,
          });
          return res.json({
            role,
            stats: [{ title: "Events Registered", value: eventsRegistered }],
          });
        }

        if (role === "alumni") {
            const eventsRegistered = await Event.countDocuments({
            "registered_users.user_id": req.user.id,
            });
            const eventsCreated = await Event.countDocuments({
              created_by: req.user.id,
            });
            //Count completed mentorships
            const completedMentorships = await MentorshipRequest.countDocuments({
              mentor_id: req.user.id,
              status: "completed",
            });
            
            return res.json({
              role,
              stats: [
                { title: "Events Registered", value: eventsRegistered },
                { title: "Events Created", value: eventsCreated },
                { title: "Completed Mentorship", value: completedMentorships },
              ],
            });
    }

    if (role === "mentor") {
      const eventsCreated = await Event.countDocuments({
        created_by: req.user.profileId,
      });

      return res.json({
        role,
        stats: [{ title: "Events Created", value: eventsCreated }],
      });
    }

        res.json({ role, stats: [] });
      } catch (err) {
        console.error(" Dashboard Stats Error:", err);
        res.status(500).json({ error: "Server Error Fetching Dashboard Stats" });
      }
};

const deletePlacementStats = async (req, res) => {
  try {
    console.log("🗑 DELETE Hit for ID:", req.params.id);

    const id = req.params.id;

    // Validate MongoDB ObjectId
    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Check if exists
    const exists = await PlacementStats.findById(id);
    console.log(" Found record:", exists);

    if (!exists) {
      return res.status(404).json({ message: "Placement record not found" });
    }

    // Proper delete
    const result = await PlacementStats.findByIdAndDelete(id);
    console.log("Deleted:", result);

    return res.json({ message: "Deleted successfully", deletedId: id });
  } catch (error) {
    console.error(" Delete Error:", error);
    return res.status(500).json({ error: "Server error during deletion" });
  }
};


const updatePlacementStats = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Only admin can update" });

    const { id } = req.params;

    const stats = await PlacementStats.findById(id);
    if (!stats)
      return res.status(404).json({ message: "Placement entry not found" });

    const {
      year,
      total_students,
      total_eligible,
      total_placed,
      higher_studies,
      avg_ctc,
      highest_ctc,
      lowest_ctc,
      median_ctc,
      branches,
      companies,
      internships
    } = req.body;

    // ---------------- SIMPLE FIELDS ----------------
    if (year !== undefined) stats.year = year;
    if (total_students !== undefined) stats.total_students = total_students;
    if (total_eligible !== undefined) stats.total_eligible = total_eligible;
    if (total_placed !== undefined) stats.total_placed = total_placed;
    if (higher_studies !== undefined) stats.higher_studies = higher_studies;

    if (avg_ctc !== undefined) stats.avg_ctc = avg_ctc;
    if (highest_ctc !== undefined) stats.highest_ctc = highest_ctc;
    if (lowest_ctc !== undefined) stats.lowest_ctc = lowest_ctc;
    if (median_ctc !== undefined) stats.median_ctc = median_ctc;

    // ---------------- ARRAYS ----------------
    if (Array.isArray(branches)) stats.branches = branches;
    if (Array.isArray(companies)) stats.companies = companies;

    // ---------------- INTERNSHIPS ----------------
    if (internships) {
      stats.internships = {
        total_internships:
          internships.total_internships ?? stats.internships.total_internships,
        paid_internships:
          internships.paid_internships ?? stats.internships.paid_internships,
        min_stipend:
          internships.min_stipend ?? stats.internships.min_stipend,
        max_stipend:
          internships.max_stipend ?? stats.internships.max_stipend,
      };
    }

    await stats.save();

    res.json({
      message: "Placement stats updated successfully",
      data: stats,
    });
  } catch (error) {
    console.error(" Update Error:", error);
    res.status(500).json({ message: "Server error updating placement stats" });
  }
};




const getSinglePlacement = async (req, res) => {
  try {
    const { id } = req.params;

    const stat = await PlacementStats.findById(id);

    if (!stat) {
      return res.status(404).json({ message: "Placement entry not found" });
    }

    res.json(stat);
  } catch (error) {
    console.error(" Single Fetch Error:", error);
    res.status(500).json({ message: "Server error fetching placement entry" });
  }
};




module.exports = {
  uploadPlacementStats,
  getPlacementAnalytics,
  getDashboardStats,
  updatePlacementStats,
  deletePlacementStats,
  getSinglePlacement
};
