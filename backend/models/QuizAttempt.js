// backend/models/QuizAttempt.js
const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  selectedOption: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  pointsWon: { type: Number, default: 0 },
  attemptedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
