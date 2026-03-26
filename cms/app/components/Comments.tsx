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
    <section className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-800">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Comments ({comments.length})</h2>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="mb-4">
            <label htmlFor="comment" className="sr-only">Your comment</label>
            <textarea
              id="comment"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="block w-full rounded-md border-0 py-2.5 px-3.5 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 bg-white dark:bg-zinc-900 bg-transparent sm:text-sm sm:leading-6"
              placeholder="What are your thoughts?"
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-6 mb-10 text-center border border-zinc-200 dark:border-zinc-700">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">Please sign in to leave a comment.</p>
          <a href="/login" className="inline-flex justify-center rounded-md bg-zinc-900 dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-zinc-900 shadow-sm hover:bg-opacity-90 transition-colors">
            Sign In
          </a>
        </div>
      )}

      <div className="space-y-8">
        {comments.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400 italic">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          comments.map((comment, index) => (
            <div key={comment.id || index} className="flex gap-x-4">
              {comment.user.image ? (
                <img src={comment.user.image} alt={comment.user.name || "User"} className="h-10 w-10 flex-none rounded-full bg-zinc-50 object-cover" />
              ) : (
                <div className="h-10 w-10 flex-none rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">{comment.user.name?.[0] || "?"}</span>
                </div>
              )}
              <div className="flex-auto">
                <div className="flex items-baseline justify-between gap-x-4">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{comment.user.name || "Anonymous"}</p>
                  <p className="flex-none text-xs text-zinc-500 dark:text-zinc-400">
                    <time dateTime={new Date(comment.createdAt).toISOString()}>{new Date(comment.createdAt).toLocaleDateString()}</time>
                  </p>
                </div>
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
