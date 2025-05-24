const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  quizId: mongoose.Schema.Types.ObjectId,
  selectedOption: String,
  timestamp: Date,
});

module.exports = mongoose.model("Answer", answerSchema);
