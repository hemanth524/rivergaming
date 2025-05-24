import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ALLOWED_BETS = [10, 50, 100];

function QuizPopup({ currentQuiz, onSubmit, token }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [betPoints, setBetPoints] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (selectedAnswer === null) {
      toast.error("Please select an answer!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/quiz/submit/${currentQuiz._id}`,
        {
          selectedOption: selectedAnswer,
          betPoints,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { correct, wallet } = response.data;
      toast.success(
        correct
          ? `Correct! You've earned ${betPoints * 2} points. Wallet: ${wallet}`
          : `Wrong answer. Wallet: ${wallet}`
      );

      onSubmit(correct, wallet);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSelectedAnswer(null);
      setBetPoints(10);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 overflow-y-auto">
      <div className="w-full max-w-md mx-2 sm:mx-0 p-6 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex flex-col">
        <h2 className="text-2xl font-bold text-center mb-6">{currentQuiz.question}</h2>

        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 max-h-60 overflow-auto">
            {currentQuiz.options.map((opt, idx) => (
              <label
                key={idx}
                className={`cursor-pointer flex items-center p-3 border rounded-lg transition-colors duration-150
                  ${selectedAnswer === idx
                    ? "bg-indigo-500/30 border-indigo-400"
                    : "bg-white/10 border-white/20 hover:bg-indigo-400/10"}
                `}
              >
                <input
                  type="radio"
                  name="answer"
                  value={idx}
                  checked={selectedAnswer === idx}
                  onChange={() => setSelectedAnswer(idx)}
                  className="mr-3 accent-indigo-500"
                />
                <span className="flex-1">{opt}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            {ALLOWED_BETS.map((bet) => (
              <button
                key={bet}
                type="button"
                onClick={() => setBetPoints(bet)}
                className={`px-4 py-2 rounded-lg border font-semibold transition
                  ${betPoints === bet
                    ? "bg-indigo-600 text-white border-indigo-600 shadow"
                    : "bg-white/10 text-white border-white/20 hover:bg-indigo-500/20"}
                `}
              >
                Bet {bet}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedAnswer === null || loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg font-semibold shadow-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Answer"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default QuizPopup;
