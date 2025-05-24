const Quiz = require('../models/Quiz');
const User = require('../models/Users');
const QuizAttempt = require('../models/QuizAttempt'); // optional, if you want to track attempts

// Admin creates a quiz
const ALLOWED_BETS = [10, 50, 100];

const createQuiz = async (req, res) => {
  const { question, options, correctOption } = req.body;

  if (!question || !options || options.length !== 4 || correctOption > 3) {
    return res.status(400).json({ message: 'Invalid quiz data' });
  }

  const quiz = new Quiz({ question, options, correctOption });
  await quiz.save();

  res.status(201).json({ message: 'Quiz created', quiz });
};

// Admin activates a quiz

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByIdAndDelete(id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, options, correctOption } = req.body;

    if (!question || !options || options.length !== 4 || correctOption < 0 || correctOption > 3) {
      return res.status(400).json({ message: 'Invalid quiz data' });
    }

    const quiz = await Quiz.findByIdAndUpdate(
      id,
      { question, options, correctOption },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.status(200).json({ message: 'Quiz updated successfully', quiz });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const activateQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    await Quiz.updateMany({}, { isActive: false }); // Deactivate all quizzes
    const quiz = await Quiz.findByIdAndUpdate(id, { isActive: true }, { new: true });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Emit real-time quiz activation event using Socket.IO
    const io = req.app.get('io');
    // Send quiz details without correctOption for safety
    const quizForClients = {
      _id: quiz._id,
      question: quiz.question,
      options: quiz.options,
      isActive: quiz.isActive
    };
    io.emit('receiveQuiz', quizForClients);

    res.status(200).json({ message: 'Quiz activated', quiz });
  } catch (error) {
    console.error('Activate quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Users fetch active quiz
const getActiveQuiz = async (req, res) => {
  const quiz = await Quiz.findOne({ isActive: true }).select('-correctOption');

  if (!quiz) {
    return res.status(404).json({ message: 'No active quiz' });
  }

  res.status(200).json({ quiz });
};



// Users submit an answer with betting points
const submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedOption, betPoints } = req.body;
    const userId = req.user.id;  // assuming auth middleware adds user object

    // Validate bet amount
    if (!ALLOWED_BETS.includes(betPoints)) {
      return res.status(400).json({ message: 'Invalid bet amount. Allowed bets: 10, 50, 100' });
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.wallet < betPoints) {
      return res.status(400).json({ message: 'Insufficient points in wallet to bet' });
    }

    const isCorrect = Number(selectedOption) === quiz.correctOption;

    

    // Deduct bet points first
    user.wallet -= betPoints;

    if (isCorrect) {
      // Reward user 2x bet points
      user.wallet += betPoints * 2;
    }

    await user.save();

    // Save quiz attempt record (optional)
    const attempt = new QuizAttempt({
      user: userId,
      quiz: id,
      selectedOption,
      betPoints,
      isCorrect,
      pointsWon: isCorrect ? betPoints * 2 : 0
    });

    await attempt.save();

    res.status(200).json({
      message: 'Answer received',
      correct: isCorrect,
      
      wallet: user.wallet
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createQuiz,
  activateQuiz,
  getActiveQuiz,
  submitAnswer,
  deleteQuiz,
  updateQuiz
 
};
