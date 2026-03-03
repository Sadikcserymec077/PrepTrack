const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { syncUser, getUserDetails } = require("../controllers/authController");

// POST /api/auth/sync - called after Firebase login to sync user to MongoDB
router.post("/sync", verifyToken, syncUser);

// GET /api/auth/me - get current authenticated user's MongoDB record
router.get("/me", verifyToken, getUserDetails);

module.exports = router;
