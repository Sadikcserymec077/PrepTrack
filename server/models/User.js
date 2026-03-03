const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  totalStudyHours: {
    type: Number,
    default: 0,
  },
  streakCount: {
    type: Number,
    default: 0,
  },
  lastStudyDate: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
