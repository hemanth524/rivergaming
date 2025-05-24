import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import ChatBox from "../components/ChatBox";
import Header from "../components/Header";

const AdminDashboard = ({ socket }) => {
  const { user, token } = useContext(AuthContext);
  const [streaming, setStreaming] = useState(false);
  const [youtubeLink, setYoutubeLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOptions, setQuizOptions] = useState(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);

  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchStreamStatus = async () => {
      try {
        const res = await fetch(`/api/stream/status`);
        const data = await res.json();
        setStreaming(data.isLive);
        if (data.stream?.youtubeLink) setYoutubeLink(data.stream.youtubeLink);
      } catch (err) {
        setError("Failed to fetch stream status");
      } finally {
        setLoading(false);
      }
    };
    fetchStreamStatus();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onStreamStarted = (data) => {
      setStreaming(true);
      if (data?.youtubeLink) setYoutubeLink(data.youtubeLink);
    };
    const onStreamStopped = () => {
      setStreaming(false);
      setYoutubeLink("");
    };

    socket.on("streamStarted", onStreamStarted);
    socket.on("streamStopped", onStreamStopped);

    return () => {
      socket.off("streamStarted", onStreamStarted);
      socket.off("streamStopped", onStreamStopped);
    };
  }, [socket]);

  const handleStartStream = async () => {
    setError("");
    try {
      const defaultEmbedLink = "https://www.youtube.com/embed/C6XRRgjMFzA";
      const res = await fetch(`/api/stream/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ youtubeLink: defaultEmbedLink }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to start stream");

      setStreaming(true);
      setYoutubeLink(data.stream.youtubeLink);
      if (socket) socket.emit("streamStarted", { youtubeLink: data.stream.youtubeLink });
    } catch (error) {
      setError(error.message);
      alert(error.message);
    }
  };

  const handleStopStream = async () => {
    setError("");
    try {
      const res = await fetch(`/api/stream/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to stop stream");

      setStreaming(false);
      setYoutubeLink("");
      if (socket) socket.emit("streamStopped");
    } catch (error) {
      setError(error.message);
      alert(error.message);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...quizOptions];
    newOptions[index] = value;
    setQuizOptions(newOptions);
  };

  const handlePushQuiz = async () => {
    setError("");
    if (
      !quizQuestion.trim() ||
      quizOptions.some((opt) => !opt.trim()) ||
      correctOptionIndex < 0 ||
      correctOptionIndex > 3
    ) {
      alert("Please fill quiz question, all options, and select correct option");
      return;
    }

    try {
      const res = await fetch(`/api/quiz/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: quizQuestion,
          options: quizOptions,
          correctOption: correctOptionIndex,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to push quiz");

      alert("Quiz pushed successfully!");
      if (socket) socket.emit("pushQuiz", data.quiz);

      setQuizQuestion("");
      setQuizOptions(["", "", "", ""]);
      setCorrectOptionIndex(0);
    } catch (error) {
      setError(error.message);
      alert(error.message);
    }
  };

  if (!user) return <div>Loading user info...</div>;
  if (loading) return <div>Loading stream status...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-500 to-white p-4">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-blue-800">Admin Panel - {user.name}</h1>
        {error && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">Error: {error}</div>
        )}
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT: Quiz Form */}
        <div className="lg:w-1/3 bg-blue/30 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-blue-100">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">Push New Quiz</h2>
          <label className="block mb-1 font-medium text-blue-900">Question</label>
          <input
            type="text"
            className="w-full p-2 border border-blue-200 rounded mb-4 bg-white/80 text-blue-900"
            value={quizQuestion}
            onChange={(e) => setQuizQuestion(e.target.value)}
            placeholder="Enter quiz question"
          />
          <label className="block mb-1 font-medium text-blue-900">Options</label>
          {quizOptions.map((opt, idx) => (
            <input
              key={idx}
              type="text"
              className="w-full p-2 mb-2 border border-blue-200 rounded bg-white/80 text-blue-900"
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
            />
          ))}
          <label className="block mb-1 font-medium text-blue-900">Correct Option</label>
          <select
            className="w-full p-2 border border-blue-200 rounded mb-4 bg-white/80 text-blue-900"
            value={correctOptionIndex}
            onChange={(e) => setCorrectOptionIndex(Number(e.target.value))}
          >
            {quizOptions.map((_, idx) => (
              <option key={idx} value={idx}>
                Option {idx + 1}
              </option>
            ))}
          </select>
          <button
            onClick={handlePushQuiz}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full font-semibold shadow"
          >
            Push Quiz
          </button>
        </div>

        {/* CENTER: Stream Button + Video */}
        <div className="lg:w-1/3 flex flex-col items-center">
          <div className="mb-4 w-full">
            {streaming ? (
              <button
                onClick={handleStopStream}
                className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold shadow"
              >
                Stop Stream
              </button>
            ) : (
              <button
                onClick={handleStartStream}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold shadow"
              >
                Start Stream
              </button>
            )}
          </div>
          {streaming && youtubeLink && (
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-blue-100 bg-white/60">
              <iframe
                className="w-full h-full"
                src={youtubeLink}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="YouTube Live Stream"
              />
            </div>
          )}
        </div>

        {/* RIGHT: Chat Box */}
        <div className="lg:w-1/3">
          <ChatBox socket={socket} user={user} isAdmin={true} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
