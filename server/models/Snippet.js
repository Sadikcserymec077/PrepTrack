const mongoose = require("mongoose");

const SnippetSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    codeContent: { type: String, required: true },
    language: { type: Number, default: 71 }, // 71 = Python Judge0 ID
    tags: { type: [String], default: [] }, // e.g. ["Graph", "Template"]
    isFavorite: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Snippet", SnippetSchema);
