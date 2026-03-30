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
    <article className="flex flex-col bg-surface-lowest rounded-3xl overflow-hidden shadow-ambient hover:shadow-ambient-lg transition-shadow">
      <div className="p-7 flex flex-col h-full">
        <div className="flex items-center gap-x-4 text-sm mb-5">
          <time dateTime={post.publishDate?.toISOString()} className="text-on-surface-variant font-medium font-[var(--font-body)]">
            {publishDate}
          </time>
          <div className="flex gap-2 flex-wrap">
            {post.tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="chip-tag rounded-md px-3 py-1 font-semibold text-xs uppercase tracking-wider"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
        <div className="group relative flex-grow">
          <h3 className="font-[var(--font-display)] text-xl font-bold leading-7 text-on-surface mb-3 group-hover:text-primary transition-colors">
            <Link href={`/posts/${post.slug}`}>
              <span className="absolute inset-0" />
              {post.title}
            </Link>
          </h3>
          <p className="line-clamp-3 text-sm leading-6 text-on-surface-variant font-[var(--font-body)]">
            {post.description}
          </p>
        </div>
        <div className="relative mt-7 flex items-center gap-x-4 shrink-0 z-10">
          <Link href={`/users/${post.user.id}`} className="flex items-center gap-x-4 hover:opacity-80 transition-opacity">
            {post.user.image ? (
              <Image
                src={post.user.image}
                alt={post.user.name || "Author"}
                className="h-10 w-10 rounded-full bg-surface-low object-cover"
                width={40}
                height={40}
                unoptimized={post.user.image.startsWith("data:")}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary-fixed/30 flex items-center justify-center">
                <span className="text-primary font-semibold">{post.user.name?.[0] || "?"}</span>
              </div>
            )}
            <div className="text-sm leading-6">
              <p className="font-semibold text-on-surface">
                {post.user.name || "Anonymous"}
              </p>
              <p className="text-on-surface-variant">Author</p>
            </div>
          </Link>
        </div>
      </div>
    </article>
  );
}
