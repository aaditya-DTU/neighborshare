import express from "express";
import Review from "../models/Review.js";
import BorrowRequest from "../models/BorrowRequest.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/reviews/user/:userId  — all reviews for a user
router.get("/user/:userId", protect, async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.userId })
      .populate("reviewerId", "name avatar")
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reviews/request/:requestId  — reviews for a specific request
router.get("/request/:requestId", protect, async (req, res) => {
  try {
    const reviews = await Review.find({ requestId: req.params.requestId })
      .populate("reviewerId", "name avatar")
      .lean();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews  — submit a review
router.post("/", protect, async (req, res) => {
  try {
    const { requestId, rating, comment } = req.body;

    const request = await BorrowRequest.findById(requestId).populate("itemId");
    if (!request || request.status !== "returned") {
      return res.status(400).json({ error: "Request must be in returned state." });
    }

    const isInvolved =
      request.borrowerId.toString() === req.userId ||
      request.ownerId.toString() === req.userId;
    if (!isInvolved) return res.status(403).json({ error: "Not authorized." });

    const revieweeId =
      request.borrowerId.toString() === req.userId
        ? request.ownerId
        : request.borrowerId;

    const review = await Review.create({
      requestId,
      reviewerId: req.userId,
      revieweeId,
      rating,
      comment,
    });

    // Recalculate trust score for reviewee
    const allReviews = await Review.find({ revieweeId });
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(revieweeId, { trustScore: Number(avg.toFixed(2)) });

    await Notification.create({
      userId: revieweeId,
      message: `You received a new ${rating}★ review.`,
      link: "/profile",
    });

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "You already reviewed this request." });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
