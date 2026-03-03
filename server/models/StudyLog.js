const mongoose = require("mongoose");

const StudyLogSchema = new mongoose.Schema({
    userId: {
        type: String, // Firebase UID
        required: true,
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true,
    },
    hoursStudied: {
        type: Number,
        required: true,
        min: 0,
        max: 24,
    },
    topicsCovered: {
        type: [String],
        default: [],
    },
    notes: {
        type: String,
        default: "",
    },
}, { timestamps: true });

// Unique per user per day
StudyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("StudyLog", StudyLogSchema);
