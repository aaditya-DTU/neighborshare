import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";
import { useApp } from "../lib/AppContext";
import { Modal } from "./Modal";

function formatDateLabel(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}

function DateSeparator({ label }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-400">
        {label}
      </span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

export function MessageThread({ open, onClose, requestId, counterparty, itemTitle }) {
  const { currentUser } = useApp();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!open || !requestId) return;

    const socket = getSocket();

    api.getMessages(requestId)
      .then(setMessages)
      .catch((err) => setError(err.message));

    socket?.emit("join_request", { requestId });

    const handleNewMessage = (msg) => {
      const isMyMessage = (msg.senderId?._id || msg.senderId) === currentUser._id;

      setMessages((prev) => {
        if (isMyMessage) {
          if (prev.find((m) => m._id === msg._id)) return prev;
          const hasOptimistic = prev.find((m) => m._optimistic);
          if (hasOptimistic) return prev.map((m) => (m._optimistic ? msg : m));
          return [...prev, msg];
        }
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    socket?.on("new_message", handleNewMessage);

    return () => {
      socket?.emit("leave_request", { requestId });
      socket?.off("new_message", handleNewMessage);
    };
  }, [open, requestId, currentUser._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim() || sending) return;

    const socket = getSocket();
    if (!socket?.connected) {
      setError("Not connected. Please refresh.");
      return;
    }

    setSending(true);
    setError(null);

    const optimisticId = `temp_${Date.now()}`;
    const optimistic = {
      _id: optimisticId,
      requestId,
      senderId: {
        _id: currentUser._id,
        name: currentUser.name,
        avatar: currentUser.avatar,
      },
      text: text.trim(),
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    const sentText = text.trim();
    setText("");

    socket.emit("send_message", { requestId, text: sentText }, (ack) => {
      setSending(false);

      if (ack?.error) {
        setError(ack.error);
        setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
        setText(sentText);
        return;
      }

      if (ack?.message) {
        setMessages((prev) =>
          prev.map((m) => (m._id === optimisticId ? ack.message : m))
        );
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => {
    setMessages([]);
    setText("");
    setError(null);
    onClose();
  };

  // build a renderable list with date separators injected between messages
  const renderItems = [];
  let lastDateLabel = null;

  messages.forEach((msg) => {
    const label = formatDateLabel(msg.createdAt);
    if (label !== lastDateLabel) {
      renderItems.push({ type: "separator", label, key: `sep_${label}` });
      lastDateLabel = label;
    }
    renderItems.push({ type: "message", msg, key: msg._id });
  });

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Chat about "${itemTitle}"`}
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col" style={{ height: "420px" }}>

        {/* counterparty strip */}
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm">
            {counterparty?.avatar}
          </span>
          <div className="text-xs text-slate-500">
            Chatting with{" "}
            <span className="font-semibold text-slate-700">{counterparty?.name}</span>
          </div>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>

        {/* message list */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No messages yet. Say hi! 👋
            </div>
          )}

          {renderItems.map((item) => {
            if (item.type === "separator") {
              return <DateSeparator key={item.key} label={item.label} />;
            }

            const { msg } = item;
            const isMe = (msg.senderId?._id || msg.senderId) === currentUser._id;

            return (
              <div
                key={msg._id}
                className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                {!isMe && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm">
                    {msg.senderId?.avatar}
                  </span>
                )}
                <div className={`max-w-[72%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed transition-opacity ${
                      msg._optimistic ? "opacity-60" : "opacity-100"
                    } ${
                      isMe
                        ? "rounded-br-sm bg-gradient-to-br from-emerald-600 to-teal-600 text-white"
                        : "rounded-bl-sm bg-slate-100 text-slate-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {msg._optimistic
                      ? "Sending…"
                      : new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                  </span>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* error */}
        {error && (
          <div className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* input */}
        <div className="mt-3 flex items-end gap-2 border-t border-slate-100 pt-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Type a message… (Enter to send)"
            className="textarea flex-1 resize-none text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="btn-primary shrink-0 px-4 py-2 text-sm"
          >
            {sending ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}