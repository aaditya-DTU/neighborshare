import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import authRoutes from "./routes/auth.js";
import itemRoutes from "./routes/items.js";
import requestRoutes from "./routes/requests.js";
import reviewRoutes from "./routes/reviews.js";
import notificationRoutes from "./routes/notifications.js";
import messageRoutes from "./routes/messages.js";
import Message from "./models/Message.js";
import BorrowRequest from "./models/BorrowRequest.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://neighborshare-nu.vercel.app",
];

// ── Socket.io ──
const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGINS, credentials: true },
});

// auth middleware — verify JWT on every socket connection
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.userId);

  // client joins a request-specific room when they open the chat
  socket.on("join_request", ({ requestId }) => {
    socket.join(`request:${requestId}`);
  });

  // client leaves the room when they close the chat
  socket.on("leave_request", ({ requestId }) => {
    socket.leave(`request:${requestId}`);
  });

  // client sends a message
  socket.on("send_message", async ({ requestId, text }, ack) => {
    try {
      if (!text?.trim()) return ack?.({ error: "Empty message" });

      // verify sender is part of this request
      const borrowReq = await BorrowRequest.findById(requestId);
      if (!borrowReq) return ack?.({ error: "Request not found" });

      const isAllowed =
        borrowReq.borrowerId.toString() === socket.userId ||
        borrowReq.ownerId.toString() === socket.userId;
      if (!isAllowed) return ack?.({ error: "Not authorized" });

      // save to DB
      const message = await Message.create({
        requestId,
        senderId: socket.userId,
        text: text.trim(),
        readBy: [socket.userId],
      });

      const populated = await Message.findById(message._id)
        .populate("senderId", "name avatar")
        .lean();

      // emit to everyone in the room (both sender and recipient if both have chat open)
      io.to(`request:${requestId}`).emit("new_message", populated);

      // figure out the other person
      const recipientId =
        borrowReq.borrowerId.toString() === socket.userId
          ? borrowReq.ownerId.toString()
          : borrowReq.borrowerId.toString();

      // check if recipient is currently in the chat room
      const room = io.sockets.adapter.rooms.get(`request:${requestId}`);
      const recipientInRoom = room
        ? [...room].some((sid) => {
            const s = io.sockets.sockets.get(sid);
            return s?.userId === recipientId;
          })
        : false;

      // if recipient is NOT in the room, send them an unread ping
      if (!recipientInRoom) {
        // count their unread messages
        const unreadCount = await Message.countDocuments({
          requestId,
          readBy: { $ne: recipientId },
        });

        // find recipient's socket(s) and emit directly
        for (const [sid, s] of io.sockets.sockets) {
          if (s.userId === recipientId) {
            s.emit("unread_ping", { requestId, count: unreadCount });
          }
        }
      }

      ack?.({ ok: true, message: populated });
    } catch (err) {
      console.error("send_message error:", err.message);
      ack?.({ error: err.message });
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.userId);
  });
});

// ── Express ──
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    httpServer.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });