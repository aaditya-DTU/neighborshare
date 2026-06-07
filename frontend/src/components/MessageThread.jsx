import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { useApp } from "../lib/AppContext";
import { Modal } from "./Modal";

export function MessageThread({ open, onClose, requestId, counterparty, itemTitle }) {
  const { currentUser } = useApp();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  // fetch messages when modal opens
  useEffect(() => {
    if (!open || !requestId) return;

    const load = async () => {
      try {
        const data = await api.getMessages(requestId);
        setMessages(data);
      } catch (err) {
        setError(err.message);
      }
    };

    load();

    // poll every 5 s while chat is open
    pollRef.current = setInterval(load, 5000);
    return () => clearInterval(pollRef.current);
  }, [open, requestId]);

  // scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const msg = await api.sendMessage(requestId, text.trim());
      setMessages((prev) => [...prev, msg]);
      setText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
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
    clearInterval(pollRef.current);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Chat about "${itemTitle}"`}
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col" style={{ height: "420px" }}>

        {/* counterparty info strip */}
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm">
            {counterparty?.avatar}
          </span>
          <div className="text-xs text-slate-500">
            Chatting with <span className="font-semibold text-slate-700">{counterparty?.name}</span>
          </div>
        </div>

        {/* message list */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No messages yet. Say hi! 👋
            </div>
          )}
          {messages.map((msg) => {
            const isMe = (msg.senderId?._id || msg.senderId) === currentUser._id;
            return (
              <div
                key={msg._id}
                className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* avatar — only for other person */}
                {!isMe && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm">
                    {msg.senderId?.avatar}
                  </span>
                )}

                <div className={`max-w-[72%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      isMe
                        ? "rounded-br-sm bg-gradient-to-br from-emerald-600 to-teal-600 text-white"
                        : "rounded-bl-sm bg-slate-100 text-slate-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* error */}
        {error && (
          <div className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</div>
        )}

        {/* input row */}
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
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
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