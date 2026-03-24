import type { Post, Tag, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type PostWithDetails = Post & {
  user: User;
  tags: { tag: Tag }[];
};

export default function PostCard({ post }: { post: PostWithDetails }) {
  const publishDate = post.publishDate ? new Date(post.publishDate).toLocaleDateString() : "";

  return (
    <article className="flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-x-4 text-sm mb-4">
          <time dateTime={post.publishDate?.toISOString()} className="text-zinc-500 dark:text-zinc-400 font-medium">
            {publishDate}
          </time>
          <div className="flex gap-2 flex-wrap">
            {post.tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="relative z-10 rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 font-medium text-blue-600 dark:text-blue-400"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
        <div className="group relative flex-grow">
          <h3 className="text-xl font-bold leading-6 text-zinc-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <Link href={`/posts/${post.slug}`}>
              <span className="absolute inset-0" />
              {post.title}
            </Link>
          </h3>
          <p className="line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {post.description}
          </p>
        </div>
        <div className="relative mt-6 flex items-center gap-x-4 shrink-0">
          {post.user.image ? (
            <Image
              src={post.user.image}
              alt={post.user.name || "Author"}
              className="h-10 w-10 rounded-full bg-zinc-50 object-cover"
              width={40}
              height={40}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">{post.user.name?.[0] || "?"}</span>
            </div>
          )}
          <div className="text-sm leading-6">
            <p className="font-semibold text-zinc-900 dark:text-white">
              <span className="absolute inset-0" />
              {post.user.name || "Anonymous"}
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">Author</p>
          </div>
        </div>
      </div>
    </article>
  );
}
