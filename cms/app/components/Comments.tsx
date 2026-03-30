"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CommentUser = {
  name: string | null;
  image: string | null;
};

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  user: CommentUser;
};

type Props = {
  postId: string;
  initialComments: Comment[];
  isLoggedIn: boolean;
};

export default function Comments({ postId, initialComments, isLoggedIn }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !isLoggedIn) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content: content.trim() }),
      });

      if (res.ok) {
        const newComment = await res.json();
        newComment.createdAt = new Date(newComment.createdAt);
        setComments((prev) => [newComment, ...prev]);
        setContent("");
        router.refresh();
      } else {
        alert("Failed to post comment.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-20 pt-12">
      <h2 className="font-[var(--font-display)] text-2xl font-bold text-on-surface mb-8">Comments ({comments.length})</h2>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="mb-4">
            <label htmlFor="comment" className="sr-only">Your comment</label>
            <textarea
              id="comment"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="block w-full rounded-2xl py-3.5 px-4.5 text-on-surface bg-surface-lowest ghost-border ghost-border-focus placeholder:text-on-surface-variant/50 font-[var(--font-body)] text-sm leading-6 outline-none transition-colors"
              placeholder="What are your thoughts?"
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="inline-flex justify-center rounded-full gradient-primary px-6 py-2.5 text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <div className="bg-surface-low rounded-2xl p-8 mb-12 text-center">
          <p className="text-on-surface-variant mb-5 font-[var(--font-body)]">Please sign in to leave a comment.</p>
          <a href="/login" className="inline-flex justify-center rounded-full gradient-primary px-6 py-2.5 text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity">
            Sign In
          </a>
        </div>
      )}

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-on-surface-variant italic font-[var(--font-body)]">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          comments.map((comment, index) => (
            <div key={comment.id || index} className="flex gap-x-4 bg-surface-lowest rounded-2xl p-5">
              {comment.user.image ? (
                <img src={comment.user.image} alt={comment.user.name || "User"} className="h-10 w-10 flex-none rounded-full bg-surface-low object-cover" />
              ) : (
                <div className="h-10 w-10 flex-none rounded-full bg-primary-fixed/30 flex items-center justify-center">
                  <span className="text-primary font-semibold">{comment.user.name?.[0] || "?"}</span>
                </div>
              )}
              <div className="flex-auto">
                <div className="flex items-baseline justify-between gap-x-4">
                  <p className="text-sm font-semibold text-on-surface">{comment.user.name || "Anonymous"}</p>
                  <p className="flex-none text-xs text-on-surface-variant">
                    <time dateTime={new Date(comment.createdAt).toISOString()}>{new Date(comment.createdAt).toLocaleDateString()}</time>
                  </p>
                </div>
                <p className="mt-1.5 text-sm text-on-surface-variant whitespace-pre-wrap font-[var(--font-body)]">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
