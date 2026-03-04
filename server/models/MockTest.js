const mongoose = require("mongoose");

const MockTestSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    type: { type: String, enum: ["DSA", "Aptitude", "Logical Reasoning", "Verbal", "Other"], required: true },
    title: { type: String, required: true },
    score: { type: Number, required: true },
    totalScore: { type: Number, required: true },
    timeTaken: { type: Number, required: true }, // in minutes
    accuracy: { type: Number, required: true },
    weakTopics: { type: [String], default: [] },
    dateTaken: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("MockTest", MockTestSchema);
