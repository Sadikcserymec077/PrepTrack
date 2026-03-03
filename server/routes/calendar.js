const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const StudyLog = require("../models/StudyLog");
const User = require("../models/User");

// GET /api/calendar - Get all study logs for user
router.get("/", verifyToken, async (req, res) => {
    try {
        const logs = await StudyLog.find({ userId: req.user.uid }).sort({ date: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch study logs" });
    }
});

// POST /api/calendar - Log study session for a day
router.post("/", verifyToken, async (req, res) => {
    try {
        const { date, hoursStudied, topicsCovered, notes } = req.body;

        // Upsert - update if exists, create if not
        const log = await StudyLog.findOneAndUpdate(
            { userId: req.user.uid, date },
            { hoursStudied, topicsCovered, notes },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // Update user total study hours and streak
        const user = await User.findOne({ firebaseUid: req.user.uid });
        if (user) {
            const allLogs = await StudyLog.find({ userId: req.user.uid }).sort({ date: -1 });
            const totalHours = allLogs.reduce((sum, l) => sum + l.hoursStudied, 0);
            user.totalStudyHours = totalHours;

            // Streak calculation
            const today = new Date().toISOString().split("T")[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
            let streak = 1;
            for (let i = 0; i < allLogs.length - 1; i++) {
                const current = new Date(allLogs[i].date);
                const next = new Date(allLogs[i + 1].date);
                const diff = (current - next) / 86400000;
                if (diff === 1) streak++;
                else break;
            }
            user.streakCount = streak;
            user.lastStudyDate = new Date();
            await user.save();
        }

        res.status(201).json(log);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save study log" });
    }
});

module.exports = router;
