// const express = require("express");
// const router = express.Router();
// const { uploadPlacementStats, getPlacementAnalytics } = require("../controllers/placementController");
// const auth = require("../middleware/auth");
// const { checkRole } = require("../middleware/checkRole");

// // ✅ Allow only admins to upload
// router.post("/upload", auth, checkRole(["admin"]), uploadPlacementStats);

// // ✅ Allow everyone (logged in) to view analytics
// router.get("/analytics", auth, getPlacementAnalytics);

// module.exports = router;

const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  uploadPlacementStats,
  getPlacementAnalytics,
  getDashboardStats,
  updatePlacementStats,
  deletePlacementStats,
  getSinglePlacement
} = require("../controllers/placementController");


router.post("/upload", auth, uploadPlacementStats);
router.get("/analytics", auth, getPlacementAnalytics);
router.get("/stats", auth, getDashboardStats);
router.put("/update/:id", auth, updatePlacementStats);
router.delete("/delete/:id", auth, deletePlacementStats);
router.get("/single/:id", auth, getSinglePlacement);

module.exports = router;
