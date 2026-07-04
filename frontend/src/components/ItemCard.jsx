import { useNavigate } from "react-router-dom";
import { useApp } from "../lib/AppContext";
import { distanceKm, formatDistance } from "../lib/geo";
import { StarRating } from "./StarRating";

export function ItemCard({ item }) {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  // item.ownerId is populated by the backend (full user object)
  const owner = item.ownerId;

  const dist =
    currentUser && currentUser._id !== owner?._id
      ? distanceKm(currentUser.location, item.location)
      : null;

  const categoryColors = {
    Books: "bg-violet-100 text-violet-700",
    Tools: "bg-orange-100 text-orange-700",
    Appliances: "bg-sky-100 text-sky-700",
    Electronics: "bg-indigo-100 text-indigo-700",
    Sports: "bg-emerald-100 text-emerald-700",
    Other: "bg-slate-100 text-slate-700",
  };

  return (
    <button
      onClick={() => navigate(`/item/${item._id}`)}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl active:translate-y-0"
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 text-7xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_35%)]" />
        <span className="relative transition duration-300 group-hover:scale-110">
          {item.image}
        </span>
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            categoryColors[item.category]
          }`}
        >
          {item.category}
        </span>
        {!item.available && (
          <span className="absolute right-3 top-3 rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-semibold text-white">
            Borrowed
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-slate-900 group-hover:text-emerald-700">
          {item.title}
        </h3>
        <p className="line-clamp-2 text-sm text-slate-500">
          {item.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-100 text-sm ring-2 ring-white">
              {owner?.avatar}
            </span>
            <div className="leading-tight">
              <div className="text-xs font-semibold text-slate-700">
                {owner?.name?.split(" ")[0]}
              </div>
              <div className="flex items-center gap-1">
                <StarRating value={owner?.trustScore ?? 0} size="sm" />
              </div>
            </div>
          </div>
          {dist !== null && (
            <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
              <svg
                className="h-3.5 w-3.5 text-emerald-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {formatDistance(dist)}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
