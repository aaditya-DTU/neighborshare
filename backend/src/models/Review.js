import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "BorrowRequest", required: true },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

// One review per request per reviewer
reviewSchema.index({ requestId: 1, reviewerId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
