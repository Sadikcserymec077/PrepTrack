const express = require("express");
const router = express.Router();
const Topic = require("../models/Topic");
const { verifyToken } = require("../middleware/auth");

/**
 * GET /api/topics — Get all topics for a user
 */
router.get("/", verifyToken, async (req, res) => {
    try {
        const topics = await Topic.find({ userId: req.user.uid }).sort({ createdAt: -1 });
        res.json(topics);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch topics: " + err.message });
    }
});

/**
 * GET /api/topics/:id — Get a single topic for detail view
 */
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const topic = await Topic.findOne({ _id: req.params.id, userId: req.user.uid });
        if (!topic) return res.status(404).json({ error: "Topic not found" });
        res.json(topic);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch topic details" });
    }
});

/**
 * POST /api/topics — Add a new topic
 */
router.post("/", verifyToken, async (req, res) => {
    try {
        const {
            subjectName, topicName, problemStatement, difficultyLevel,
            notesHTML, revisionNotesHTML, images, youtubeUrl, questions
        } = req.body;

        const existing = await Topic.findOne({ userId: req.user.uid, subjectName, topicName });
        if (existing) {
            return res.status(400).json({ error: "Topic already exists for this subject!" });
        }

        const topic = new Topic({
            userId: req.user.uid,
            subjectName,
            topicName,
            problemStatement: problemStatement || "",
            difficultyLevel: difficultyLevel || "Medium",
            notesHTML: notesHTML || "",
            revisionNotesHTML: revisionNotesHTML || "",
            youtubeUrl: youtubeUrl || "",
            images: images || [],
            questions: questions || []
        });

        await topic.save();
        res.status(201).json(topic);
    } catch (err) {
        console.error("Error saving topic:", err);
        res.status(500).json({ error: "Server error saving topic" });
    }
});

/**
 * PUT /api/topics/:id — Update topic (full editor sync)
 */
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const {
            notesHTML, revisionNotesHTML, images, isRevised, difficultyLevel, youtubeUrl, questions, problemStatement
        } = req.body;

        const topic = await Topic.findOne({ _id: req.params.id, userId: req.user.uid });
        if (!topic) return res.status(404).json({ error: "Topic not found" });

        if (difficultyLevel !== undefined) topic.difficultyLevel = difficultyLevel;
        if (notesHTML !== undefined) topic.notesHTML = notesHTML;
        if (revisionNotesHTML !== undefined) topic.revisionNotesHTML = revisionNotesHTML;
        if (youtubeUrl !== undefined) topic.youtubeUrl = youtubeUrl;
        if (images !== undefined) topic.images = images;
        if (questions !== undefined) topic.questions = questions;
        if (problemStatement !== undefined) topic.problemStatement = problemStatement;

        if (isRevised !== undefined) {
            topic.isRevised = isRevised;
            if (isRevised) {
                topic.revisionCount += 1;
                topic.lastRevised = new Date();
            }
        }

        topic.lastPracticedDate = new Date();
        await topic.save();

        res.json(topic);
    } catch (err) {
        console.error("Error updating topic:", err);
        res.status(500).json({ error: "Error updating topic" });
    }
});

/**
 * DELETE /api/topics/:id — Delete a topic
 */
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const deleted = await Topic.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
        if (!deleted) return res.status(404).json({ error: "Topic not found" });
        res.json({ message: "Topic deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error deleting topic" });
    }
});

module.exports = router;
