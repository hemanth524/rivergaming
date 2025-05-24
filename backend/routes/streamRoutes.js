const express = require("express");
const streamController = require("../controllers/streamController");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

module.exports = function(io) {
  const router = express.Router();

  router.post("/start", protect, requireRole("admin"), streamController.startStream(io));
  router.post("/stop", protect, requireRole("admin"), streamController.stopStream(io));
  router.get("/status", streamController.getStreamStatus);

  return router;
};
