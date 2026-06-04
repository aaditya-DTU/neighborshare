import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../lib/AppContext";

export function Navbar() {
  const { currentUser, logout, notifications, unreadCount, markNotificationsRead } = useApp();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const recentNotifs = notifications.slice(0, 8);

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-emerald-100 text-emerald-800"
        : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12l9-9 9 9" />
              <path d="M5 10v10h14V10" />
              <path d="M9 20v-6h6v6" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-base font-bold leading-tight text-slate-900">
              NeighborShare
            </div>
            <div className="hidden text-[10px] uppercase tracking-wider text-slate-400 sm:block">
              Community Resource Sharing
            </div>
          </div>
        </button>

        {currentUser && (
          <>
            <nav className="hidden items-center gap-1 md:flex">
              <NavLink to="/" end className={linkClass}>Browse</NavLink>
              <NavLink to="/my-items" className={linkClass}>My Items</NavLink>
              <NavLink to="/requests" className={linkClass}>Requests</NavLink>
              <NavLink to="/profile" className={linkClass}>Profile</NavLink>
            </nav>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifOpen((o) => !o);
                    if (!notifOpen) markNotificationsRead();
                  }}
                  className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
                  aria-label="Notifications"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10 21a2 2 0 0 0 4 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                      Notifications
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {recentNotifs.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        recentNotifs.map((n) => (
                          <div
                            key={n._id}
                            className="border-b border-slate-50 px-4 py-3 text-sm last:border-0"
                          >
                            <div className="text-slate-700">{n.message}</div>
                            <div className="mt-1 text-[11px] text-slate-400">
                              {new Date(n.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar */}
              <button
                onClick={() => navigate("/profile")}
                className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 pr-3 hover:bg-slate-50 sm:flex"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-base">
                  {currentUser.avatar}
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {currentUser.name.split(" ")[0]}
                </span>
              </button>

              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:block"
              >
                Logout
              </button>

              {/* Mobile menu toggle */}
              <button
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
                onClick={() => setMenuOpen((m) => !m)}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {currentUser && menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-2 md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink to="/" end onClick={() => setMenuOpen(false)} className={linkClass}>Browse</NavLink>
            <NavLink to="/my-items" onClick={() => setMenuOpen(false)} className={linkClass}>My Items</NavLink>
            <NavLink to="/requests" onClick={() => setMenuOpen(false)} className={linkClass}>Requests</NavLink>
            <NavLink to="/profile" onClick={() => setMenuOpen(false)} className={linkClass}>Profile</NavLink>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
