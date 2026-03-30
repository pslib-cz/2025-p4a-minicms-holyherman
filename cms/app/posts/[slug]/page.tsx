import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Comments from "@/app/components/Comments";
import { auth } from "@/auth";

type Props = {
  params: Promise<{ slug: string }>;
};


export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: { user: true, tags: { include: { tag: true } } },
  });

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishDate?.toISOString(),
      authors: [post.user.name || "Anonymous"],
      tags: post.tags.map((t: any) => t.tag.name),
    },
  };
}

export const dynamicParams = true;
export const dynamic = "force-dynamic";

export default async function PostPage(props: Props) {
  const session = await auth();
  const params = await props.params;

  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      user: true,
      tags: { include: { tag: true } },
      comments: {
        include: { user: true },
        orderBy: { createdAt: "desc" }
      }
    },
  });

  if (!post || (!post.published && post.concept)) {
    notFound();
  }

  const tagIds = post.tags.map((t: any) => t.tagId);
  const relatedPosts = await prisma.post.findMany({
    where: {
      tags: { some: { tagId: { in: tagIds } } },
      id: { not: post.id },
      published: true,
      concept: false,
    },
    include: { user: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const publishDate = post.publishDate ? new Date(post.publishDate).toLocaleDateString() : "";

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
      <div className="mb-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Articles
        </Link>
      </div>
      <header className="mb-16">
        <div className="flex gap-2 mb-7 flex-wrap">
          {post.tags.map(({ tag }: any) => (
            <span
              key={tag.id}
              className="chip-tag rounded-md px-3 py-1 font-semibold text-xs uppercase tracking-wider"
            >
              {tag.name}
            </span>
          ))}
        </div>
        <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl font-extrabold tracking-tight text-on-surface mb-7" style={{ letterSpacing: "-0.02em" }}>
          {post.title}
        </h1>
        <p className="text-xl text-on-surface-variant mb-10 leading-relaxed font-[var(--font-body)]">
          {post.description}
        </p>
        <Link href={`/users/${post.user.id}`} className="flex items-center gap-x-4 bg-surface-low rounded-2xl p-5 hover:bg-surface-low/80 transition-colors">
          {post.user.image ? (
            <Image
              src={post.user.image}
              alt={post.user.name || "Author"}
              className="h-12 w-12 rounded-full bg-surface-low object-cover"
              width={48}
              height={48}
              unoptimized={post.user.image.startsWith("data:")}
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-primary-fixed/30 flex items-center justify-center">
              <span className="text-primary font-semibold text-lg">{post.user.name?.[0] || "?"}</span>
            </div>
          )}
          <div>
            <p className="font-semibold text-on-surface">
              {post.user.name || "Anonymous"}
            </p>
            <time dateTime={post.publishDate?.toISOString()} className="text-sm text-on-surface-variant">
              Published on {publishDate}
            </time>
          </div>
        </Link>
      </header>

      <div
        className="prose prose-lg max-w-none prose-headings:font-[var(--font-display)] prose-headings:text-on-surface prose-p:text-on-surface-variant prose-p:font-[var(--font-body)] prose-strong:text-on-surface prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {relatedPosts.length > 0 && (
        <div className="mt-20 pt-10">
          <h3 className="font-[var(--font-display)] text-xl font-bold text-on-surface mb-8">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((rp: any) => (
              <Link key={rp.id} href={`/posts/${rp.slug}`} className="block group">
                <div className="bg-surface-lowest rounded-2xl p-6 shadow-ambient transition-all group-hover:shadow-ambient-lg h-full flex flex-col justify-between">
                  <div>
                    <h4 className="font-[var(--font-display)] font-bold text-lg text-on-surface mb-2 line-clamp-2 group-hover:text-primary transition-colors">{rp.title}</h4>
                    <p className="text-sm text-on-surface-variant line-clamp-2 mb-5 font-[var(--font-body)]">{rp.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span className="font-semibold">{rp.user.name || "Anonymous"}</span>
                    <time dateTime={rp.publishDate?.toISOString()}>{rp.publishDate ? new Date(rp.publishDate).toLocaleDateString() : ""}</time>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Comments
        postId={post.id}
        initialComments={post.comments}
        isLoggedIn={!!session?.user}
      />
    </article>
  );
}
