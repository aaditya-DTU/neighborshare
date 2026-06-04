import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../lib/AppContext";

export function LoginPage() {
  const { login, signup } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    if (mode === "login") {
      const error = await login(email, password);
      if (error) { setErr(error); setLoading(false); return; }
      navigate("/");
    } else {
      const error = await signup({
        name: name.trim() || "Neighbor",
        email,
        password,
        label: label.trim() || "My Neighborhood",
        lat: 37.7749 + (Math.random() - 0.5) * 0.02,
        lng: -122.4194 + (Math.random() - 0.5) * 0.02,
      });
      if (error) { setErr(error); setLoading(false); return; }
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid md:grid-cols-2">

        {/* Left visual */}
        <div className="relative hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-10 text-white md:flex md:flex-col">
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
                <path d="M3 12l9-9 9 9" />
                <path d="M5 10v10h14V10" />
              </svg>
            </div>
            <span className="text-lg font-bold">NeighborShare</span>
          </div>
          <h2 className="text-3xl font-bold leading-tight">
            Share what you have. <br />
            Borrow what you need.
          </h2>
          <p className="mt-4 text-emerald-50/90">
            A trust-based platform for lending and borrowing rarely used items right in your neighborhood.
          </p>
          <div className="mt-10 space-y-4">
            {[
              { icon: "📍", title: "Geo-based discovery", desc: "Find items within walking distance" },
              { icon: "🤝", title: "Request & approve", desc: "Owners stay in control of their items" },
              { icon: "⭐", title: "Trust scores", desc: "Reviews keep the community accountable" },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-lg backdrop-blur">
                  {f.icon}
                </div>
                <div>
                  <div className="font-semibold">{f.title}</div>
                  <div className="text-sm text-emerald-50/80">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto text-xs text-emerald-100/70">
            Data stored securely in MongoDB.
          </div>
        </div>

        {/* Right form */}
        <div className="p-6 sm:p-10">
          <div className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                mode === "login" ? "bg-white text-slate-900 shadow" : "text-slate-500"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                mode === "signup" ? "bg-white text-slate-900 shadow" : "text-slate-500"
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <>
                <Field label="Name">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    placeholder="Your name"
                  />
                </Field>
                <Field label="Neighborhood">
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="input"
                    placeholder="e.g. Mission District"
                  />
                </Field>
              </>
            )}
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </Field>

            {err && (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 py-2.5 font-semibold text-white shadow-md transition hover:shadow-lg disabled:opacity-60"
            >
              {loading
                ? "Please wait…"
                : mode === "login"
                ? "Sign in"
                : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
