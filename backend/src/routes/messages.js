import express from "express";
import Message from "../models/Message.js";
import BorrowRequest from "../models/BorrowRequest.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// helper — check caller is part of the request
async function getRequestIfAllowed(requestId, userId) {
  const req = await BorrowRequest.findById(requestId);
  if (!req) return null;
  const allowed =
    req.borrowerId.toString() === userId ||
    req.ownerId.toString() === userId;
  return allowed ? req : null;
}

// GET /api/messages/:requestId  — fetch thread + mark all as read
router.get("/:requestId", protect, async (req, res) => {
  try {
    const borrowReq = await getRequestIfAllowed(req.params.requestId, req.userId);
    if (!borrowReq) return res.status(403).json({ error: "Not authorized." });

    const messages = await Message.find({ requestId: req.params.requestId })
      .populate("senderId", "name avatar")
      .sort({ createdAt: 1 })
      .lean();

    // mark unread messages as read for this user
    await Message.updateMany(
      { requestId: req.params.requestId, readBy: { $ne: req.userId } },
      { $addToSet: { readBy: req.userId } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messages/:requestId  — send a message
router.post("/:requestId", protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "Message cannot be empty." });

    const borrowReq = await getRequestIfAllowed(req.params.requestId, req.userId);
    if (!borrowReq) return res.status(403).json({ error: "Not authorized." });

    const message = await Message.create({
      requestId: req.params.requestId,
      senderId: req.userId,
      text: text.trim(),
      readBy: [req.userId], // sender has already "read" their own message
    });

    const populated = await Message.findById(message._id)
      .populate("senderId", "name avatar")
      .lean();

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messages/:requestId/unread  — unread count for badge
router.get("/:requestId/unread", protect, async (req, res) => {
  try {
    const borrowReq = await getRequestIfAllowed(req.params.requestId, req.userId);
    if (!borrowReq) return res.status(403).json({ error: "Not authorized." });

    const count = await Message.countDocuments({
      requestId: req.params.requestId,
      readBy: { $ne: req.userId },
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;