import { useMemo, useState } from "react";
import { useApp } from "../lib/AppContext";
import { distanceKm } from "../lib/geo";
import { ItemCard } from "../components/ItemCard";

const CATEGORIES = ["All", "Books", "Tools", "Appliances", "Electronics", "Sports", "Other"];

export function BrowsePage() {
  const { items, currentUser } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [radius, setRadius] = useState(10);
  const [showUnavailable, setShowUnavailable] = useState(false);

  const filtered = useMemo(() => {
    if (!currentUser) return [];
    return items
      .filter((i) => {
        // item.ownerId is a populated object from the backend
        const ownerId = i.ownerId?._id || i.ownerId;
        return ownerId !== currentUser._id;
      })
      .filter((i) => (showUnavailable ? true : i.available))
      .filter((i) => (category === "All" ? true : i.category === category))
      .filter((i) =>
        query
          ? i.title.toLowerCase().includes(query.toLowerCase()) ||
            i.description.toLowerCase().includes(query.toLowerCase())
          : true
      )
      .map((i) => ({
        ...i,
        _dist: distanceKm(currentUser.location, i.location),
      }))
      .filter((i) => i._dist <= radius)
      .sort((a, b) => a._dist - b._dist);
  }, [items, currentUser, query, category, radius, showUnavailable]);

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header banner */}
      <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-medium text-emerald-100">
              👋 Hi, {currentUser.name.split(" ")[0]}
            </div>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              Discover items near you
            </h1>
            <p className="mt-2 max-w-xl text-emerald-50/90">
              Browse what your neighbors are sharing in{" "}
              <span className="font-semibold">{currentUser.location.label}</span>.
              Borrow what you need, share what you have.
            </p>
          </div>
          <div className="flex gap-3">
            <Stat label="Items nearby" value={filtered.length} />
            <Stat label="Within" value={`${radius} km`} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search drill, books, tent..."
              className="input pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase text-slate-500">Radius</label>
            <input
              type="range"
              min={1}
              max={50}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-28 accent-emerald-600"
            />
            <span className="w-12 text-sm font-medium text-slate-700">{radius} km</span>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={showUnavailable}
              onChange={(e) => setShowUnavailable(e.target.checked)}
              className="accent-emerald-600"
            />
            Include borrowed
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                category === c
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="mb-3 text-5xl">🔍</div>
          <h3 className="text-lg font-semibold text-slate-700">No items match your filters</h3>
          <p className="mt-1 text-sm text-slate-500">Try widening your radius or clearing the search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur">
      <div className="text-xs uppercase tracking-wider text-emerald-100/80">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
