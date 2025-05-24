const Stream = require("../models/Streams");

// Start Stream
exports.startStream = (io) => async (req, res) => {
  try {
    const { youtubeLink } = req.body;

    if (!youtubeLink) {
      return res.status(400).json({ message: "Stream link is required" });
    }

    // Stop any existing live streams first
    await Stream.updateMany({ isLive: true }, { isLive: false, stoppedAt: new Date() });

    const newStream = await Stream.create({
      isLive: true,
      startedAt: new Date(),
      youtubeLink,
    });

    io.emit("streamStarted", { youtubeLink });

    res.status(201).json({
      message: "Stream started",
      stream: newStream,
    });
  } catch (err) {
    console.error("Error starting stream:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Stop Stream
exports.stopStream = (io) => async (req, res) => {
  try {
    const current = await Stream.findOne({ isLive: true });
    if (!current) {
      return res.status(400).json({ message: "No active stream" });
    }

    current.isLive = false;
    current.stoppedAt = new Date();
    await current.save();

    io.emit("streamStopped");

    res.status(200).json({
      message: "Stream stopped",
      stream: current,
    });
  } catch (err) {
    console.error("Error stopping stream:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Stream Status
exports.getStreamStatus = async (req, res) => {
  try {
    const live = await Stream.findOne({ isLive: true });

    res.status(200).json({
      isLive: !!live,
      stream: live || null,
    });
  } catch (err) {
    console.error("Error getting stream status:", err);
    res.status(500).json({ message: "Server error" });
  }
};
