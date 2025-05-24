import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const ChatBox = ({ socket }) => {
  const { user, token } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const messagesEndRef = useRef(null);
  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    if (!isOpen) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMessages(data.messages);
      } catch (error) {
        toast.error("Failed to load chat messages.");
      }
    };
    fetchMessages();
  }, [token, isOpen]);

  useEffect(() => {
    if (!socket) return;
    if (!isOpen) return;
    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on("receiveMessage", handleNewMessage);
    return () => socket.off("receiveMessage", handleNewMessage);
  }, [socket, isOpen]);

  const handleSend = async () => {
    if (!content.trim()) return;
    if (!socket || !socket.connected) {
      toast.error("Cannot send message: not connected to server.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send message");
      setContent("");
    } catch (err) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700"
        >
          Show Chat
        </button>
      </div>
    );
  }

  return (
    <div
      className={`
        fixed z-50
        bottom-4 right-4
        w-[95vw] max-w-sm
        md:w-96 md:max-w-md
        rounded-2xl shadow-2xl
        flex flex-col
        text-gray-800
        bg-gradient-to-br from-blue-100 via-purple-100 to-white
        border border-blue-200
      `}
      style={{ minHeight: "350px", maxHeight: "70vh" }}
    >
      <div className="flex justify-between items-center px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-blue-900">Live Chat</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-red-400 font-bold text-xl"
          aria-label="Close chat"
          title="Close chat"
        >
          ×
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto border border-blue-100 rounded-lg mx-4 p-3 bg-white/70"
        style={{ minHeight: 0 }}
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400">No messages yet.</div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-3">
            <span className="font-semibold text-blue-600">
              {msg.user?.name || "User"}:{" "}
            </span>
            <span>{msg.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 pt-2 flex gap-2">
        <input
          type="text"
          className="flex-1 rounded-lg p-2 bg-white/80 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!loading) handleSend();
            }
          }}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
