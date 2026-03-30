import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { name: true },
  });

  if (!user) return { title: "User Not Found" };

  return {
    title: `${user.name || "Anonymous"} - Author Profile`,
  };
}

export default async function PublicProfilePage(props: Props) {
  const params = await props.params;

  const user = await prisma.user.findUnique({
    where: { id: params.id },
  });

  if (!user) {
    notFound();
  }

  const posts = await prisma.post.findMany({
    where: {
      userId: user.id,
      published: true,
      concept: false,
    },
    include: {
      user: true,
      tags: { include: { tag: true } },
    },
    orderBy: { publishDate: "desc" },
  });

  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
      <div className="mb-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Articles
        </Link>
      </div>

      <div className="bg-surface-lowest rounded-3xl shadow-ambient overflow-hidden mb-16">
        <div className="h-36 gradient-primary"></div>
        <div className="px-6 sm:px-10 pb-10">
          <div className="relative -mt-14 sm:-mt-16 mb-8">
            <div className="p-1.5 bg-surface-lowest rounded-full inline-block">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={120}
                  height={120}
                  className="rounded-full w-24 h-24 sm:w-32 sm:h-32 object-cover bg-surface-low"
                  unoptimized={user.image.startsWith("data:")}
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary-fixed/30 flex items-center justify-center text-4xl text-primary font-bold">
                  {user.name?.[0] || "?"}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
            <div>
              <h1 className="font-[var(--font-display)] text-3xl font-bold text-on-surface mb-1">
                {user.name || "Anonymous"}
              </h1>
              <p className="text-on-surface-variant font-[var(--font-body)]">
                {posts.length} published {posts.length === 1 ? "article" : "articles"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="font-[var(--font-display)] text-2xl font-bold text-on-surface mb-10">
        Published Articles
      </h2>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-surface-lowest rounded-3xl shadow-ambient">
          <p className="text-on-surface-variant font-[var(--font-body)]">
            This author hasn't published any articles yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="flex flex-col bg-surface-lowest rounded-3xl overflow-hidden shadow-ambient hover:shadow-ambient-lg transition-shadow">
              <div className="p-7 flex flex-col h-full">
                <div className="flex items-center gap-x-4 text-sm mb-5">
                  <time dateTime={post.publishDate?.toISOString()} className="text-on-surface-variant font-medium font-[var(--font-body)]">
                    {post.publishDate ? new Date(post.publishDate).toLocaleDateString() : ""}
                  </time>
                  <div className="flex gap-2 flex-wrap">
                    {post.tags.map(({ tag }) => (
                      <span key={tag.id} className="chip-tag rounded-md px-3 py-1 font-semibold text-xs uppercase tracking-wider">
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
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
