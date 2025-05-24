import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import QuizPopup from "../components/QuizPopup";
import ChatBox from "../components/ChatBox";
import { toast } from "react-toastify";

const UserDashboard = ({ socket }) => {
  const { user, token, updateUser } = useContext(AuthContext);
  const [isLive, setIsLive] = useState(false);
  const [youtubeLink, setYoutubeLink] = useState("");
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [showQuizPopup, setShowQuizPopup] = useState(false);
  const [wallet, setWallet] = useState(user?.wallet || 50);

  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchStreamStatus = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/stream/status`);
        const data = await res.json();
        setIsLive(data.isLive);
        if (data.stream?.youtubeLink) setYoutubeLink(data.stream.youtubeLink);
      } catch (err) {
        console.error("Error fetching stream status:", err);
      }
    };
    fetchStreamStatus();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onStreamStarted = (data) => {
      setIsLive(true);
      if (data?.youtubeLink) setYoutubeLink(data.youtubeLink);
    };

    const onStreamStopped = () => {
      setIsLive(false);
      setYoutubeLink("");
      setActiveQuiz(null);
      setShowQuizPopup(false);
    };

    socket.on("streamStarted", onStreamStarted);
    socket.on("streamStopped", onStreamStopped);

    return () => {
      socket.off("streamStarted", onStreamStarted);
      socket.off("streamStopped", onStreamStopped);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const onQuizPushed = (quiz) => {
      setActiveQuiz(quiz);
      setShowQuizPopup(true);
    };

    socket.on("pushQuiz", onQuizPushed);
    return () => socket.off("pushQuiz", onQuizPushed);
  }, [socket]);

  const handleQuizSubmit = (correct, updatedWallet) => {
    setWallet(updatedWallet);
    updateUser({ wallet: updatedWallet });
    setShowQuizPopup(false);
    setActiveQuiz(null);

    toast(
      correct
        ? `✅ Correct! Wallet: ${updatedWallet} points`
        : `❌ Wrong answer. Wallet: ${updatedWallet} points`
    );
  };

  if (!user) return <div>Loading user info...</div>;

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-pink-700">Welcome, {user.name}</h1>
        <div className="bg-white/80 px-4 py-2 rounded-xl shadow flex items-center gap-2">
          <span className="font-semibold text-gray-700">Wallet:</span>
          <span className="text-green-700 font-bold">{wallet} points</span>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row max-w-4xl  mx-auto gap-6">
        {/* Video Stream Section */}
        <div className="flex-1 flex flex-col">
          {isLive && youtubeLink ? (
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-blue-100 bg-white/60">
              <iframe
                className="w-full h-full"
                src={youtubeLink}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="YouTube Live Stream"
              />
            </div>
          ) : (
            <div className="text-center text-gray-600 font-semibold my-12 border rounded-2xl p-8 bg-white/80 shadow-2xl">
              Stream is not live currently.
            </div>
          )}
        </div>
      </div>

      {/* Floating Chat Box */}
      <ChatBox socket={socket} user={user} />

      {showQuizPopup && activeQuiz && (
        <QuizPopup
          key={activeQuiz._id}
          currentQuiz={activeQuiz}
          token={token}
          onSubmit={handleQuizSubmit}
        />
      )}
    </div>
  );
};

export default UserDashboard;
