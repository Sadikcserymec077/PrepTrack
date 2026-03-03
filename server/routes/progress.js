const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { getDashboardData } = require("../controllers/progressController");

// GET /api/progress/dashboard
router.get("/dashboard", verifyToken, getDashboardData);

module.exports = router;
