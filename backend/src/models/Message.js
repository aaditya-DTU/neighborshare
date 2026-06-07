import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "BorrowRequest", required: true },
    senderId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text:      { type: String, required: true, trim: true },
    readBy:    [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

messageSchema.index({ requestId: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);