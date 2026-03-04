const mongoose = require("mongoose");

const StudyPlanSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    date: { type: Date, required: true },
    tasks: [{
        title: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        category: { type: String, default: "Other" }
    }]
}, { timestamps: true });

module.exports = mongoose.model("StudyPlan", StudyPlanSchema);
