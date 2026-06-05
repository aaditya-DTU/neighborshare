import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: "📍",
    title: "Geo-based discovery",
    desc: "Browse items listed by real neighbors within walking distance. Set your radius and instantly see what's available around you.",
  },
  {
    icon: "🤝",
    title: "Request & approve",
    desc: "Send a borrow request with a message and duration. Owners stay in full control — they approve, reject, or chat with you first.",
  },
  {
    icon: "⭐",
    title: "Trust scores",
    desc: "After every exchange, both parties leave a review. Ratings build your community reputation over time.",
  },
  {
    icon: "🔔",
    title: "Real-time notifications",
    desc: "Get notified the moment someone requests your item, approves your borrow, or leaves you a review.",
  },
  {
    icon: "📦",
    title: "Any category",
    desc: "Books, tools, appliances, electronics, sports gear — if you own it and rarely use it, share it.",
  },
  {
    icon: "🔒",
    title: "Secure & private",
    desc: "JWT-backed accounts, bcrypt passwords, and MongoDB storage. Your data stays yours.",
  },
];

const steps = [
  { num: "01", title: "Create your account", desc: "Sign up with your email, set your neighborhood, and you're in." },
  { num: "02", title: "List what you own", desc: "Add items you rarely use with a description, category, and emoji icon." },
  { num: "03", title: "Browse or borrow", desc: "Find items near you, send a request, and wait for the owner to approve." },
  { num: "04", title: "Return & review", desc: "Mark the item returned and leave an honest review to build community trust." },
];

const categories = [
  { icon: "📚", label: "Books" },
  { icon: "🔧", label: "Tools" },
  { icon: "🍳", label: "Appliances" },
  { icon: "💻", label: "Electronics" },
  { icon: "⛺", label: "Sports" },
  { icon: "📦", label: "Other" },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12l9-9 9 9" />
                <path d="M5 10v10h14V10" />
                <path d="M9 20v-6h6v6" />
              </svg>
            </div>
            <span className="text-base font-bold text-slate-900">NeighborShare</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="hover:text-emerald-700 transition">Features</a>
            <a href="#how" className="hover:text-emerald-700 transition">How it works</a>
            <a href="#categories" className="hover:text-emerald-700 transition">Categories</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/login")}
              className="rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition"
            >
              Get started →
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 px-6 py-24 text-white sm:py-32">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
            Community resource sharing, reimagined
          </div>
          <h1 className="text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
            Share what you have.<br />
            <span className="text-emerald-200">Borrow what you need.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-emerald-50/90 sm:text-xl">
            NeighborShare connects you with neighbors to lend and borrow everyday items — drills, books, camping gear, and more — without the cost or clutter of buying new.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate("/login")}
              className="rounded-xl bg-white px-8 py-4 text-base font-semibold text-emerald-700 shadow-lg hover:shadow-xl transition"
            >
              Start sharing for free
            </button>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-4 text-base font-medium text-white backdrop-blur hover:bg-white/10 transition"
            >
              See how it works
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-4 sm:gap-8">
            {[
              { value: "10 km", label: "Default browse radius" },
              { value: "6", label: "Item categories" },
              { value: "5★", label: "Trust score system" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/10 px-4 py-5 backdrop-blur">
                <div className="text-2xl font-bold sm:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-emerald-100/70 sm:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories pill bar ── */}
      <section id="categories" className="border-b border-slate-100 bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-slate-400">Browse by category</p>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((c) => (
              <button
                key={c.label}
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                <span>{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Everything you need to share with confidence</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-500">
              Built for real neighborhoods — with the tools to make borrowing feel safe, easy, and social.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md transition-all duration-200"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl group-hover:bg-emerald-100 transition">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="bg-gradient-to-br from-slate-50 to-emerald-50/30 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Up and running in minutes</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-500">Four simple steps to start borrowing and lending in your neighborhood.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute left-full top-8 hidden h-px w-full -translate-x-1/2 bg-gradient-to-r from-emerald-200 to-transparent lg:block" />
                )}
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-md">
                  {s.num}
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Item card mockup ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                Your neighborhood marketplace, minus the price tags
              </h2>
              <p className="mt-4 text-slate-500 leading-relaxed">
                Every listed item shows the owner's trust score, distance from you, and availability status. No guesswork — just borrow.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Distance calculated with the Haversine formula — accurate to the meter",
                  "Borrow duration you set — 1 to 30 days",
                  "Owner reviews build a real trust score over time",
                  "Items lock automatically when approved, unlock on return",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/login")}
                className="btn-primary mt-10"
              >
                Browse items near you →
              </button>
            </div>
            {/* Mock item card */}
            <div className="flex justify-center">
              <div className="w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-8xl">
                  🔧
                  <span className="absolute left-3 top-3 rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-semibold text-orange-700">
                    Tools
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    Available
                  </span>
                </div>
                <div className="p-5">
                  <h4 className="text-base font-semibold text-slate-900">Cordless Drill (DeWalt)</h4>
                  <p className="mt-1 text-sm text-slate-500">18V, two batteries included. Great for weekend projects.</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-sm">🙂</span>
                      <div>
                        <div className="text-xs font-medium text-slate-700">Ramesh</div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((n) => (
                            <svg key={n} className="h-3 w-3 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <svg className="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      0.8 km
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/login")}
                    className="btn-primary mt-4 w-full"
                  >
                    Request to borrow
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-10 text-center text-white shadow-xl sm:p-16">
          <h2 className="text-3xl font-bold sm:text-4xl">Your neighbors are already sharing.</h2>
          <p className="mx-auto mt-4 max-w-lg text-emerald-50/90">
            Join NeighborShare today — list your first item in under two minutes.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-8 rounded-xl bg-white px-8 py-4 text-base font-semibold text-emerald-700 shadow-lg hover:shadow-xl transition"
          >
            Create a free account →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                <path d="M3 12l9-9 9 9" />
                <path d="M5 10v10h14V10" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-700">NeighborShare</span>
          </div>
          <p className="text-xs text-slate-400">Community Resource Sharing Platform</p>
        </div>
      </footer>
    </div>
  );
}