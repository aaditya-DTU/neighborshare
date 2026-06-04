import express from "express";
import BorrowRequest from "../models/BorrowRequest.js";
import Item from "../models/Item.js";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const populate = (q) =>
  q
    .populate("borrowerId", "-password")
    .populate("ownerId", "-password")
    .populate("itemId");

// GET /api/requests  — all requests involving current user
router.get("/", protect, async (req, res) => {
  try {
    const requests = await populate(
      BorrowRequest.find({
        $or: [{ borrowerId: req.userId }, { ownerId: req.userId }],
      }).sort({ createdAt: -1 })
    ).lean();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/requests  — create a borrow request
router.post("/", protect, async (req, res) => {
  try {
    const { itemId, message, durationDays } = req.body;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ error: "Item not found." });
    if (item.ownerId.toString() === req.userId) {
      return res.status(400).json({ error: "You cannot borrow your own item." });
    }
    if (!item.available) {
      return res.status(400).json({ error: "This item is not currently available." });
    }
    const exists = await BorrowRequest.findOne({
      itemId,
      borrowerId: req.userId,
      status: { $in: ["pending", "approved"] },
    });
    if (exists) {
      return res.status(400).json({ error: "You already have an active request for this item." });
    }

    const request = await BorrowRequest.create({
      itemId,
      borrowerId: req.userId,
      ownerId: item.ownerId,
      message,
      durationDays,
    });

    await Notification.create({
      userId: item.ownerId,
      message: `Someone requested to borrow "${item.title}".`,
      link: "/requests",
    });

    res.status(201).json(await populate(BorrowRequest.findById(request._id)).lean());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/requests/:id/approve
router.patch("/:id/approve", protect, async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id).populate("itemId");
    if (!request || request.status !== "pending") {
      return res.status(400).json({ error: "Invalid request." });
    }
    if (request.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: "Not authorized." });
    }

    request.status = "approved";
    request.approvedAt = new Date();
    await request.save();

    await Item.findByIdAndUpdate(request.itemId._id, { available: false });

    await Notification.create({
      userId: request.borrowerId,
      message: `Your request for "${request.itemId.title}" was approved!`,
      link: "/requests",
    });

    res.json(await populate(BorrowRequest.findById(request._id)).lean());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/requests/:id/reject
router.patch("/:id/reject", protect, async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id).populate("itemId");
    if (!request || request.status !== "pending") {
      return res.status(400).json({ error: "Invalid request." });
    }
    if (request.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: "Not authorized." });
    }

    request.status = "rejected";
    await request.save();

    await Notification.create({
      userId: request.borrowerId,
      message: `Your request for "${request.itemId.title}" was declined.`,
      link: "/requests",
    });

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/requests/:id/cancel
router.patch("/:id/cancel", protect, async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id);
    if (!request || request.status !== "pending") {
      return res.status(400).json({ error: "Invalid request." });
    }
    if (request.borrowerId.toString() !== req.userId) {
      return res.status(403).json({ error: "Not authorized." });
    }

    request.status = "cancelled";
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/requests/:id/return
router.patch("/:id/return", protect, async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id).populate("itemId");
    if (!request || request.status !== "approved") {
      return res.status(400).json({ error: "Invalid request." });
    }
    const isInvolved =
      request.borrowerId.toString() === req.userId ||
      request.ownerId.toString() === req.userId;
    if (!isInvolved) return res.status(403).json({ error: "Not authorized." });

    request.status = "returned";
    request.returnedAt = new Date();
    await request.save();

    await Item.findByIdAndUpdate(request.itemId._id, { available: true });

    const notifyId =
      request.borrowerId.toString() === req.userId
        ? request.ownerId
        : request.borrowerId;

    await Notification.create({
      userId: notifyId,
      message: `"${request.itemId.title}" has been marked as returned. Leave a review!`,
      link: "/requests",
    });

    res.json(await populate(BorrowRequest.findById(request._id)).lean());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
