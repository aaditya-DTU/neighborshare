import express from "express";
import Item from "../models/Item.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/items  — all items (excluding current user's own)
router.get("/", protect, async (req, res) => {
  try {
    const items = await Item.find().populate("ownerId", "-password").lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/items/mine  — only current user's items
router.get("/mine", protect, async (req, res) => {
  try {
    const items = await Item.find({ ownerId: req.userId }).lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/items/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("ownerId", "-password")
      .lean();
    if (!item) return res.status(404).json({ error: "Item not found." });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/items  — create item
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, category, image, location } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required." });
    const item = await Item.create({
      ownerId: req.userId,
      title,
      description,
      category,
      image,
      location,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/items/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found." });
    if (item.ownerId.toString() !== req.userId) {
      return res.status(403).json({ error: "Not your item." });
    }
    await item.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
