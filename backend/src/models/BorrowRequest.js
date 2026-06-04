import mongoose from "mongoose";

const borrowRequestSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "returned", "cancelled"],
      default: "pending",
    },
    durationDays: { type: Number, required: true },
    approvedAt: Date,
    returnedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("BorrowRequest", borrowRequestSchema);
