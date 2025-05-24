const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require("../middleware/roleMiddleware");
const {
  createQuiz,
  activateQuiz,
  getActiveQuiz,
  submitAnswer,
  deleteQuiz,
  updateQuiz
  
} = require('../controllers/quizController');



router.post('/create', protect,requireRole("admin"), createQuiz);
router.delete('/delete/:id', protect, requireRole("admin"), deleteQuiz);
router.put('/update/:id', protect, requireRole("admin"), updateQuiz);
router.post('/activate/:id', protect, activateQuiz);
router.get('/active', getActiveQuiz);
router.post('/submit/:id', protect, submitAnswer);

module.exports = router;
