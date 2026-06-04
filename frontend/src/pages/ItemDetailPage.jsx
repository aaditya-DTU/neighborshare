import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../lib/AppContext";
import { api } from "../lib/api";
import { distanceKm, formatDistance } from "../lib/geo";
import { Modal } from "../components/Modal";
import { StarRating } from "../components/StarRating";

export function ItemDetailPage() {
  const { id } = useParams();
  const { currentUser, requests, createRequest } = useApp();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [ownerReviews, setOwnerReviews] = useState([]);
  const [notFound, setNotFound] = useState(false);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [days, setDays] = useState(3);
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch item + owner reviews
  useEffect(() => {
    api
      .getItem(id)
      .then((data) => {
        setItem(data);
        // owner is populated; fetch their reviews
        const ownerId = data.ownerId?._id || data.ownerId;
        return api.getReviewsForUser(ownerId);
      })
      .then(setOwnerReviews)
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="text-6xl">📭</div>
        <h2 className="mt-4 text-2xl font-bold text-slate-800">Item not found</h2>
        <button onClick={() => navigate("/")} className="btn-primary mt-6">Back to browse</button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-400 text-sm">
        Loading…
      </div>
    );
  }

  const owner = item.ownerId; // populated object
  const isOwner = currentUser?._id === (owner?._id || owner);

  const dist =
    currentUser && !isOwner && item.location
      ? distanceKm(currentUser.location, item.location)
      : null;

  const myActiveReq = requests.find(
    (r) =>
      (r.itemId?._id || r.itemId) === item._id &&
      (r.borrowerId?._id || r.borrowerId) === currentUser?._id &&
      (r.status === "pending" || r.status === "approved")
  );

  const submitRequest = async () => {
    setErr(null);
    const error = await createRequest(item._id, message, days);
    if (error) return setErr(error);
    setSuccess(true);
    setTimeout(() => {
      setOpen(false);
      setSuccess(false);
      setMessage("");
      navigate("/requests");
    }, 1100);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-emerald-700"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Visual + map */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm">
          <div className="flex h-80 items-center justify-center text-9xl">{item.image}</div>
          <div className="relative h-48 border-t border-slate-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 400 200">
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={`h${i}`} x1={0} y1={i * 25} x2={400} y2={i * 25} stroke="#10b981" strokeWidth={0.5} />
              ))}
              {Array.from({ length: 16 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 25} y1={0} x2={i * 25} y2={200} stroke="#10b981" strokeWidth={0.5} />
              ))}
            </svg>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">📍</div>
            <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow backdrop-blur">
              {item.location?.label}
            </div>
            {dist !== null && (
              <div className="absolute right-3 top-3 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow">
                {formatDistance(dist)} away
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <span className="chip mb-3 self-start">{item.category}</span>
          <h1 className="text-3xl font-bold text-slate-900">{item.title}</h1>
          {!item.available && (
            <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Currently borrowed
            </span>
          )}
          <p className="mt-4 leading-relaxed text-slate-600">{item.description}</p>

          {/* Owner card */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Shared by</div>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">
                {owner?.avatar}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-800">{owner?.name}</div>
                <div className="flex items-center gap-2">
                  <StarRating value={owner?.trustScore ?? 0} size="sm" />
                  <span className="text-xs text-slate-500">
                    {owner?.trustScore?.toFixed(1)} • {ownerReviews.length} review
                    {ownerReviews.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </div>
            {owner?.bio && (
              <p className="mt-3 text-sm italic text-slate-500">"{owner.bio}"</p>
            )}
          </div>

          {/* Action button */}
          <div className="mt-6">
            {isOwner ? (
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                This is your item. Manage it from{" "}
                <button onClick={() => navigate("/my-items")} className="font-semibold text-emerald-700 hover:underline">
                  My Items
                </button>.
              </div>
            ) : myActiveReq ? (
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                You have a <span className="font-semibold">{myActiveReq.status}</span> request for this item.{" "}
                <button onClick={() => navigate("/requests")} className="font-semibold underline">View</button>
              </div>
            ) : (
              <button
                onClick={() => setOpen(true)}
                disabled={!item.available}
                className="btn-primary w-full py-3 text-base"
              >
                {item.available ? "Request to Borrow" : "Currently Unavailable"}
              </button>
            )}
          </div>

          {/* Reviews */}
          {ownerReviews.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Recent reviews for {owner?.name?.split(" ")[0]}
              </h3>
              <div className="space-y-3">
                {ownerReviews.slice(0, 3).map((r) => (
                  <div key={r._id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{r.reviewerId?.avatar}</span>
                        <span className="text-sm font-medium text-slate-700">{r.reviewerId?.name}</span>
                      </div>
                      <StarRating value={r.rating} size="sm" />
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Borrow modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Request to Borrow">
        {success ? (
          <div className="py-6 text-center">
            <div className="mb-3 text-5xl">✅</div>
            <div className="font-semibold text-slate-800">Request sent!</div>
            <div className="text-sm text-slate-500">{owner?.name} will be notified.</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{item.image}</span>
                <div>
                  <div className="font-semibold text-slate-800">{item.title}</div>
                  <div className="text-xs text-slate-500">Owned by {owner?.name}</div>
                </div>
              </div>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Borrow duration</span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="flex-1 accent-emerald-600"
                />
                <span className="w-16 text-right text-sm font-semibold text-slate-700">
                  {days} day{days !== 1 ? "s" : ""}
                </span>
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Message to owner</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Hi! I'd love to borrow this for a weekend project..."
                className="textarea"
              />
            </label>
            {err && (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={submitRequest} className="btn-primary flex-1">Send Request</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
