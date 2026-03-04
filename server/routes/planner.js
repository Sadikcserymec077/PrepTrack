const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const StudyPlan = require('../models/StudyPlan');

// Generic error handler
const handleError = (res, err) => {
    console.error(err);
    res.status(500).json({ error: "Server error" });
};

// GET all study plans for a user
router.get('/', verifyToken, async (req, res) => {
    try {
        const plans = await StudyPlan.find({ userId: req.user.uid }).sort({ date: -1 });
        res.json(plans);
    } catch (err) { handleError(res, err); }
});

// GET study plan for a specific date (today)
router.get('/today', verifyToken, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // start of day

        let plan = await StudyPlan.findOne({
            userId: req.user.uid,
            date: { $gte: today, $lte: new Date(today.getTime() + 86400000) }
        });

        // Auto-create an empty daily study plan if none exists
        if (!plan) {
            plan = await StudyPlan.create({
                userId: req.user.uid,
                date: new Date(),
                tasks: []
            });
        }
        res.json(plan);
    } catch (err) { handleError(res, err); }
});

// POST to update a specific study plan tasks
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updated = await StudyPlan.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.uid },
            { tasks: req.body.tasks },
            { new: true }
        );
        res.json(updated);
    } catch (err) { handleError(res, err); }
});

module.exports = router;
