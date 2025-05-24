const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema({
  isLive: { type: Boolean, default: false },
  startedAt: { type: Date },
  stoppedAt: { type: Date },
  youtubeLink: { type: String }, // Add this line
}, { timestamps: true });

module.exports = mongoose.model("Stream", streamSchema);
