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

// Revalidate every 60 seconds
export const revalidate = 60;

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

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true, concept: false },
    select: { slug: true },
  });

  return posts.map((post: any) => ({
    slug: post.slug,
  }));
}

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
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Articles
        </Link>
      </div>
      <header className="mb-12">
        <div className="flex gap-2 mb-6 flex-wrap">
          {post.tags.map(({ tag }: any) => (
            <span
              key={tag.id}
              className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 font-medium text-blue-600 dark:text-blue-400 text-sm"
            >
              {tag.name}
            </span>
          ))}
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-6">
          {post.title}
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
          {post.description}
        </p>
        <div className="flex items-center gap-x-4 border-t border-b border-zinc-200 dark:border-zinc-800 py-6">
          {post.user.image ? (
            <Image
              src={post.user.image}
              alt={post.user.name || "Author"}
              className="h-12 w-12 rounded-full bg-zinc-50 object-cover"
              width={48}
              height={48}
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">{post.user.name?.[0] || "?"}</span>
            </div>
          )}
          <div>
            <p className="font-medium text-zinc-900 dark:text-white">
              {post.user.name || "Anonymous"}
            </p>
            <time dateTime={post.publishDate?.toISOString()} className="text-sm text-zinc-500 dark:text-zinc-400">
              Published on {publishDate}
            </time>
          </div>
        </div>
      </header>

      <div 
        className="prose prose-zinc dark:prose-invert prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      {relatedPosts.length > 0 && (
        <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Související články</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((rp: any) => (
              <Link key={rp.id} href={`/posts/${rp.slug}`} className="block group">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-5 border border-zinc-200 dark:border-zinc-700 transition-colors group-hover:border-blue-500 dark:group-hover:border-blue-400 h-full flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">{rp.title}</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4">{rp.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
                    <span>{rp.user.name || "Anonymous"}</span>
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
