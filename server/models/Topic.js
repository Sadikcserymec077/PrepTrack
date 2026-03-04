const mongoose = require("mongoose");

const TopicSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    subjectName: {
        type: String,
        required: true,
        enum: ["DSA", "numerical ability", "Logical Reasoning", "Verbal", "Core"],
    },
    topicName: { type: String, required: true },
    totalQuestions: { type: Number, default: 0 },
    solvedQuestions: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    difficultyLevel: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Medium",
    },
    lastPracticedDate: { type: Date, default: null },

    // ─── NEW NOTION-STYLE DATA FIELDS ──────────────────────────────

    // Rich Text Notes
    notesHTML: { type: String, default: "" }, // Main Concept Notes
    youtubeUrl: { type: String, default: "" }, // Embedded YouTube video link
    isImportant: { type: Boolean, default: false }, // Feature 7: Bookmark System

    // Revision System
    revisionNotesHTML: { type: String, default: "" }, // Quick Summary
    revisionCount: { type: Number, default: 0 },
    isRevised: { type: Boolean, default: false },
    lastRevised: { type: Date, default: null },

    // Embedded Questions (for DSA/Coding separated tracking)
    questions: [{
        title: { type: String, required: true },
        difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
        approachHTML: { type: String, default: "" },
        edgeCasesHTML: { type: String, default: "" },
        codeSolution: { type: String, default: "" },
        codeLanguage: { type: Number, default: 71 }, // 71 represents Python by default
        youtubeUrl: { type: String, default: "" },
        input: { type: String, default: "" },
        output: { type: String, default: "" },
        platform: { type: String, enum: ["LeetCode", "GeeksforGeeks", "HackerRank", "Codeforces", "Custom", ""], default: "Custom" },
        timeTaken: { type: Number, default: 0 }, // Tracking minutes took
        status: { type: String, enum: ["Solved", "Attempted", "Unsolved"], default: "Solved" },
        dateAdded: { type: Date, default: Date.now }
    }],

    // Cloudinary Images
    images: { type: [String], default: [] }
}, { timestamps: true });

// Auto calculate accuracy before saving
TopicSchema.pre("save", function () {
    this.totalQuestions = this.questions ? this.questions.length : 0;
    this.solvedQuestions = this.questions ? this.questions.length : 0;
    if (this.totalQuestions > 0) {
        this.accuracy = 100; // Simplified
    } else {
        this.accuracy = 0;
    }
});

module.exports = mongoose.model("Topic", TopicSchema);
