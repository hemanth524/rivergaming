const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const fs=require('fs')

const path=require('path')

const quizRoutes = require("./routes/quizRoutes");
const walletRoutes = require("./routes/walletRoutes");
const messageRoutes = require("./routes/messageRoutes");
const authRoutes = require("./routes/authroute");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Make io accessible in req.app.get('io')
app.set("io", io);

// Import streamRoutes as a function (not as a router)
const streamRoutes = require("./routes/streamRoutes");
app.use("/api/stream", streamRoutes(io));

// Other routes
app.use("/api/quiz", quizRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/messages", messageRoutes);

const distPath = path.join(__dirname, '..', 'frontend', 'dist');

// Serve static files from Vite build
app.use(express.static(distPath));

// Fallback to index.html for client-side routing
app.get('/{*any}', (req, res) => {
  const indexFile = path.join(distPath, 'index.html');
  fs.readFile(indexFile, 'utf8', (err, html) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Server Error');
    }
    res.send(html);
  });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on("sendMessage", (data) => {
    socket.broadcast.emit("receiveMessage", data);
  });

   socket.on("pushQuiz", (quiz) => {
    // Broadcast quiz to all connected clients except sender
    socket.broadcast.emit("pushQuiz", quiz);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
