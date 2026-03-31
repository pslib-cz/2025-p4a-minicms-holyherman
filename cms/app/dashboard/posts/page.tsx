"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  concept: boolean;
  publishDate: string | null;
  tags: { tag: { id: string; name: string } }[];
  user?: { name: string | null; email: string | null };
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchPosts = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?page=${p}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
        setTotalPages(data.totalPages || 1);
        setIsAdmin(data.isAdmin || false);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPosts(page);
      } else {
        alert("Failed to delete post");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const colSpan = isAdmin ? 6 : 5;

  return (
    <div>
      <div className="flex justify-between mb-8 items-center">
        <h2 className="font-[var(--font-display)] text-2xl font-bold text-on-surface">
          {isAdmin ? "All Posts (Admin)" : "My Posts"}
        </h2>
        <Link
          href="/dashboard/posts/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full gradient-primary text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Post
        </Link>
      </div>

      <div className="bg-surface-lowest rounded-3xl shadow-ambient overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="bg-surface-low">
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-[var(--font-body)]">Title</th>
                {isAdmin && (
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-[var(--font-body)]">Author</th>
                )}
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-[var(--font-body)]">Status</th>
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-[var(--font-body)]">Tags</th>
                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-[var(--font-body)]">Date</th>
                <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-[var(--font-body)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={colSpan} className="text-center py-16">
                    <div className="inline-block w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="text-center py-12">
                    <p className="text-on-surface-variant font-[var(--font-body)] mb-4">
                      {isAdmin ? "No posts found in the system." : "You haven't created any posts yet."}
                    </p>
                    <Link href="/dashboard/posts/new" className="text-primary font-semibold hover:text-primary-container transition-colors">
                      Create your first post
                    </Link>
                  </td>
                </tr>
              ) : (
                posts.map((post, i) => (
                  <tr key={post.id}>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-on-surface text-sm">{post.title}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5 font-[var(--font-body)]">/{post.slug}</p>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-5 text-sm text-on-surface-variant font-[var(--font-body)]">
                        {post.user?.name || post.user?.email || "—"}
                      </td>
                    )}
                    <td className="px-6 py-5">
                      {post.concept ? (
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-secondary-container/20 text-secondary uppercase tracking-wider">Draft</span>
                      ) : post.published ? (
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-primary-fixed/20 text-primary uppercase tracking-wider">Published</span>
                      ) : (
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-secondary-container/30 text-secondary uppercase tracking-wider">Archived</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-1.5 flex-wrap">
                        {post.tags.map((t) => (
                          <span key={t.tag.id} className="chip-tag rounded-md px-2.5 py-0.5 text-xs font-semibold">
                            {t.tag.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant font-[var(--font-body)]">
                      {post.publishDate ? new Date(post.publishDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-1">
                        {post.published && !post.concept && (
                          <a
                            href={`/posts/${post.slug}`}
                            target="_blank"
                            className="p-2 rounded-xl text-on-surface-variant hover:text-tertiary hover:bg-surface-low transition-colors"
                            title="View Public Post"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                        <Link
                          href={`/dashboard/posts/${post.id}/edit`}
                          className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-low transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 rounded-xl text-on-surface-variant hover:text-secondary hover:bg-secondary-container/10 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                page === i + 1
                  ? "gradient-primary text-on-primary"
                  : "bg-surface-lowest text-on-surface-variant shadow-ambient hover:text-primary"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
