import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["Books", "Tools", "Appliances", "Electronics", "Sports", "Other"],
      default: "Other",
    },
    image: { type: String, default: "📦" },
    location: {
      lat: Number,
      lng: Number,
      label: String,
    },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);
