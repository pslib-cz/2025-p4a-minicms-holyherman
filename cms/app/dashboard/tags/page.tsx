"use client";

import { useState, useEffect } from "react";

type Tag = {
  id: string;
  name: string;
  slug: string;
};

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tags");
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });

      if (res.ok) {
        setNewTagName("");
        fetchTags();
      } else {
        const errText = await res.text();
        setError(errText || "Failed to create tag");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will remove the tag from all posts.")) return;

    try {
      const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTags();
      } else {
        alert("Failed to delete tag");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-[800px]">
      <h2 className="font-[var(--font-display)] text-2xl font-bold text-on-surface mb-8">
        Tags Management
      </h2>

      <div className="bg-surface-lowest rounded-3xl shadow-ambient p-7 mb-8">
        <h3 className="font-[var(--font-display)] text-lg font-bold text-on-surface mb-5">Create New Tag</h3>
        <form onSubmit={handleCreate} className="flex gap-4 items-start">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              disabled={creating}
              className={`block w-full px-4 py-2.5 rounded-xl bg-surface-lowest text-on-surface text-sm outline-none transition-colors font-[var(--font-body)] placeholder:text-on-surface-variant/50 ${error ? "border border-secondary" : "ghost-border ghost-border-focus"}`}
            />
            {error && <p className="mt-1.5 text-xs text-secondary font-medium">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={!newTagName.trim() || creating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full gradient-primary text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity disabled:opacity-40 whitespace-nowrap"
          >
            {creating ? (
              <div className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
            Add Tag
          </button>
        </form>
      </div>

      <div className="bg-surface-lowest rounded-3xl shadow-ambient overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        ) : tags.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-on-surface-variant font-[var(--font-body)]">No tags have been created yet.</p>
          </div>
        ) : (
          <div className="py-2">
            {tags.map((tag, i) => (
              <div
                key={tag.id}
                className={`flex items-center justify-between px-7 py-4 ${i < tags.length - 1 ? "mb-1" : ""}`}
              >
                <div>
                  <p className="font-semibold text-on-surface text-sm">{tag.name}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5 font-[var(--font-body)]">Slug: {tag.slug}</p>
                </div>
                <button
                  onClick={() => handleDelete(tag.id)}
                  className="p-2 rounded-xl text-on-surface-variant hover:text-secondary hover:bg-secondary-container/10 transition-colors"
                  title="Delete tag"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
