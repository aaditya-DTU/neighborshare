import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../lib/AppContext";
import { api } from "../lib/api";
import { Modal } from "../components/Modal";
import { StarRating } from "../components/StarRating";
import { MessageThread } from "../components/MessageThread";

export function RequestsPage() {
  const { requests, currentUser } = useApp();
  const [tab, setTab] = useState("incoming");

  if (!currentUser) return null;

  const incoming = useMemo(
    () =>
      requests
        .filter((r) => (r.ownerId?._id || r.ownerId) === currentUser._id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [requests, currentUser]
  );

  const outgoing = useMemo(
    () =>
      requests
        .filter((r) => (r.borrowerId?._id || r.borrowerId) === currentUser._id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [requests, currentUser]
  );

  const list = tab === "incoming" ? incoming : outgoing;
  const pendingIn = incoming.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Borrow Requests</h1>
        <p className="mt-1 text-sm text-slate-500">Track the full lifecycle of every borrow.</p>
      </div>

      <div className="mb-4 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        <button
          onClick={() => setTab("incoming")}
          className={`relative flex-1 rounded-lg py-2 text-sm font-medium transition ${
            tab === "incoming" ? "bg-emerald-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Incoming
          {pendingIn > 0 && (
            <span className={`ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${
              tab === "incoming" ? "bg-white text-emerald-700" : "bg-rose-500 text-white"
            }`}>
              {pendingIn}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("outgoing")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            tab === "outgoing" ? "bg-emerald-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Outgoing
        </button>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="mb-3 text-5xl">📬</div>
          <h3 className="text-lg font-semibold text-slate-700">No {tab} requests</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((req) => (
            <RequestRow key={req._id} req={req} mode={tab} />
          ))}
        </div>
      )}
    </div>
  );
}

const STATUS_STYLES = {
  pending:   "bg-amber-100 text-amber-800",
  approved:  "bg-blue-100 text-blue-800",
  rejected:  "bg-slate-200 text-slate-700",
  cancelled: "bg-slate-200 text-slate-700",
  returned:  "bg-emerald-100 text-emerald-800",
};

function RequestRow({ req, mode }) {
  const { currentUser, approveRequest, rejectRequest, cancelRequest, returnItem, submitReview } = useApp();
  const navigate = useNavigate();

  const item         = req.itemId;
  const counterparty = mode === "incoming" ? req.borrowerId : req.ownerId;

  // review state
  const [reviewOpen, setReviewOpen]   = useState(false);
  const [rating, setRating]           = useState(5);
  const [comment, setComment]         = useState("");
  const [myReview, setMyReview]       = useState(null);
  const [otherReview, setOtherReview] = useState(null);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  // chat state
  const [chatOpen, setChatOpen]       = useState(false);
  const [unread, setUnread]           = useState(0);

  // load reviews when returned
  useState(() => {
    if (req.status !== "returned" || reviewsLoaded) return;
    api.getReviewsForRequest(req._id).then((reviews) => {
      setMyReview(reviews.find((r) => (r.reviewerId?._id || r.reviewerId) === currentUser._id) || null);
      setOtherReview(reviews.find((r) => (r.reviewerId?._id || r.reviewerId) !== currentUser._id) || null);
      setReviewsLoaded(true);
    });
  });

  // poll unread count for active requests
  useEffect(() => {
    const active = req.status === "pending" || req.status === "approved";
    if (!active) return;

    const fetchUnread = () =>
      api.getUnreadCount(req._id)
        .then(({ count }) => setUnread(count))
        .catch(() => {});

    fetchUnread();
    const id = setInterval(fetchUnread, 10000);
    return () => clearInterval(id);
  }, [req._id, req.status]);

  if (!item || !counterparty) return null;

  const handleSubmitReview = async () => {
    await submitReview(req._id, rating, comment);
    const reviews = await api.getReviewsForRequest(req._id);
    setMyReview(reviews.find((r) => (r.reviewerId?._id || r.reviewerId) === currentUser._id) || null);
    setOtherReview(reviews.find((r) => (r.reviewerId?._id || r.reviewerId) !== currentUser._id) || null);
    setReviewOpen(false);
    setComment("");
    setRating(5);
  };

  const showChat = req.status === "pending" || req.status === "approved";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <button
          onClick={() => navigate(`/item/${item._id}`)}
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 text-3xl"
        >
          {item.image}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-slate-800">{item.title}</h3>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[req.status]}`}>
              {req.status}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span>{counterparty.avatar}</span>
              <span className="font-medium text-slate-700">
                {mode === "incoming" ? "From" : "To"} {counterparty.name}
              </span>
            </span>
            <span>•</span>
            <span>{req.durationDays} day{req.durationDays !== 1 ? "s" : ""}</span>
            <span>•</span>
            <span>{new Date(req.createdAt).toLocaleDateString()}</span>
          </div>
          {req.message && (
            <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm italic text-slate-600">
              "{req.message}"
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col">
          {mode === "incoming" && req.status === "pending" && (
            <>
              <button onClick={() => approveRequest(req._id)} className="btn-primary px-3 py-1.5 text-xs">Approve</button>
              <button onClick={() => rejectRequest(req._id)} className="btn-danger px-3 py-1.5 text-xs">Reject</button>
            </>
          )}
          {mode === "outgoing" && req.status === "pending" && (
            <button onClick={() => cancelRequest(req._id)} className="btn-secondary px-3 py-1.5 text-xs">Cancel</button>
          )}
          {req.status === "approved" && (
            <button onClick={() => returnItem(req._id)} className="btn-primary px-3 py-1.5 text-xs">Mark Returned</button>
          )}
          {req.status === "returned" && !myReview && (
            <button onClick={() => setReviewOpen(true)} className="btn-secondary px-3 py-1.5 text-xs">⭐ Leave Review</button>
          )}
          {req.status === "returned" && myReview && (
            <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">✓ Reviewed</span>
          )}

          {/* ── Chat button ── */}
          {showChat && (
            <button
              onClick={() => {
                setChatOpen(true);
                setUnread(0);
              }}
              className="btn-secondary relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Chat
              {unread > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Reviews */}
      {(myReview || otherReview) && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {myReview && <ReviewBox label="Your review" rating={myReview.rating} comment={myReview.comment} />}
            {otherReview && (
              <ReviewBox
                label={`${counterparty.name?.split(" ")[0]}'s review`}
                rating={otherReview.rating}
                comment={otherReview.comment}
              />
            )}
          </div>
        </div>
      )}

      {/* Review modal */}
      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title={`Review ${counterparty.name}`}>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-sm text-slate-500">How was your experience?</div>
            <div className="mt-3 flex justify-center">
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Optional comment..."
            className="textarea"
          />
          <button onClick={handleSubmitReview} className="btn-primary w-full">Submit Review</button>
        </div>
      </Modal>

      {/* Chat modal */}
      <MessageThread
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        requestId={req._id}
        counterparty={counterparty}
        itemTitle={item.title}
      />
    </div>
  );
}

function ReviewBox({ label, rating, comment }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</div>
        <StarRating value={rating} size="sm" />
      </div>
      {comment && <p className="mt-1 text-sm text-slate-600">{comment}</p>}
    </div>
  );
}