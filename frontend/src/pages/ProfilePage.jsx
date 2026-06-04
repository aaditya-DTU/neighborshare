import { useEffect, useState } from "react";
import { useApp } from "../lib/AppContext";
import { api } from "../lib/api";
import { StarRating } from "../components/StarRating";

export function ProfilePage() {
  const { currentUser, requests, items } = useApp();
  const [myReviews, setMyReviews] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    api.getReviewsForUser(currentUser._id).then(setMyReviews).catch(console.error);
  }, [currentUser]);

  if (!currentUser) return null;

  // items listed by this user — fetched via MyItemsPage too, but we can compute from context
  const myItems = items.filter(
    (i) => (i.ownerId?._id || i.ownerId) === currentUser._id
  );

  const lent = requests.filter(
    (r) =>
      (r.ownerId?._id || r.ownerId) === currentUser._id &&
      (r.status === "approved" || r.status === "returned")
  );

  const borrowed = requests.filter(
    (r) =>
      (r.borrowerId?._id || r.borrowerId) === currentUser._id &&
      (r.status === "approved" || r.status === "returned")
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Profile card */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 text-5xl backdrop-blur">
            {currentUser.avatar}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold sm:text-3xl">{currentUser.name}</h1>
            <div className="mt-1 flex items-center justify-center gap-2 sm:justify-start">
              <StarRating value={currentUser.trustScore} size="sm" />
              <span className="text-sm text-emerald-50">
                {currentUser.trustScore?.toFixed(1)} trust score
              </span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              📍 {currentUser.location.label}
            </div>
            {currentUser.bio && (
              <p className="mt-3 text-sm text-emerald-50/90">{currentUser.bio}</p>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Items Listed" value={myItems.length} />
          <Stat label="Times Lent" value={lent.length} />
          <Stat label="Times Borrowed" value={borrowed.length} />
          <Stat label="Reviews" value={myReviews.length} />
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">
          Reviews about you ({myReviews.length})
        </h2>
        {myReviews.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No reviews yet. Complete a borrow to start building trust.
          </div>
        ) : (
          <div className="space-y-3">
            {myReviews.map((r) => {
              const reviewer = r.reviewerId; // populated
              return (
                <div key={r._id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{reviewer?.avatar}</span>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{reviewer?.name}</div>
                        <div className="text-xs text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <StarRating value={r.rating} size="sm" />
                  </div>
                  {r.comment && (
                    <p className="mt-3 text-sm text-slate-600">{r.comment}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white/15 p-3 text-center backdrop-blur">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-emerald-50/80">{label}</div>
    </div>
  );
}
