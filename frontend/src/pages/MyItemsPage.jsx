import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../lib/AppContext";
import { Modal } from "../components/Modal";
import { api } from "../lib/api";

const EMOJIS = ["📦","🔧","🪚","🪛","🥣","🍲","📚","📖","⛺","📷","🚲","🎸","🎮","🧰","🪜","☕","🍳","💻"];
const CATEGORIES = ["Books","Tools","Appliances","Electronics","Sports","Other"];

export function MyItemsPage() {
  const { currentUser, createItem, deleteItem, requests } = useApp();
  const navigate = useNavigate();

  const [myItems, setMyItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tools");
  const [image, setImage] = useState("📦");

  // Fetch only this user's items
  useEffect(() => {
    if (!currentUser) return;
    api.getMyItems().then(setMyItems).catch(console.error);
  }, [currentUser]);

  if (!currentUser) return null;

  const submit = async () => {
    if (!title.trim()) return;
    await createItem({ title: title.trim(), description: description.trim(), category, image });
    // Re-fetch my items so the new one appears
    const updated = await api.getMyItems();
    setMyItems(updated);
    setTitle("");
    setDescription("");
    setCategory("Tools");
    setImage("📦");
    setOpen(false);
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await deleteItem(item._id);
    setMyItems((prev) => prev.filter((i) => i._id !== item._id));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Items</h1>
          <p className="mt-1 text-sm text-slate-500">
            Items you've listed for your neighbors to borrow.
          </p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          List an Item
        </button>
      </div>

      {myItems.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="mb-3 text-5xl">📦</div>
          <h3 className="text-lg font-semibold text-slate-700">No items yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            Share something you rarely use — your neighbors might love it.
          </p>
          <button onClick={() => setOpen(true)} className="btn-primary mt-4">
            List your first item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myItems.map((item) => {
            const activeReq = requests.find(
              (r) =>
                (r.itemId?._id || r.itemId) === item._id &&
                (r.status === "pending" || r.status === "approved")
            );
            return (
              <div
                key={item._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  onClick={() => navigate(`/item/${item._id}`)}
                  className="flex h-32 w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-6xl"
                >
                  {item.image}
                </button>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-800">{item.title}</h3>
                    <span className="chip shrink-0">{item.category}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    {item.available ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        Borrowed
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={!!activeReq}
                      title={activeReq ? "Cannot delete while there's an active request" : "Delete"}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="List a New Item">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cordless Drill"
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="A short description, condition, what's included..."
              className="textarea"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <div>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Pick an icon</span>
            <div className="grid grid-cols-9 gap-1">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setImage(e)}
                  className={`flex h-9 items-center justify-center rounded-lg text-xl transition ${
                    image === e ? "bg-emerald-100 ring-2 ring-emerald-500" : "bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={submit} disabled={!title.trim()} className="btn-primary flex-1">
              List Item
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
