import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PostCard from "@/app/components/PostCard";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const [user, posts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
    }),
    prisma.post.findMany({
      where: { userId: session.user.id },
      include: {
        user: true,
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  if (!user) {
    redirect("/");
  }

  const publishedPostsCount = posts.filter(
    (p) => p.published && !p.concept,
  ).length;
  const draftPostsCount = posts.length - publishedPostsCount;

  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-12">
        <div className="h-32 bg-linear-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-6 sm:px-10 pb-8">
          <div className="relative flex justify-between items-end -mt-12 sm:-mt-16 mb-6">
            <div className="p-1 bg-white dark:bg-zinc-900 rounded-full inline-block">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User Profile"}
                  width={120}
                  height={120}
                  className="rounded-full w-24 h-24 sm:w-32 sm:h-32 border-4 border-white dark:border-zinc-900 object-cover bg-zinc-100"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-4xl text-zinc-500">
                  {user.name?.[0] || "?"}
                </div>
              )}
            </div>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors font-medium text-sm flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign Out
              </button>
            </form>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
                {user.name}
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400">{user.email}</p>
            </div>

            <div className="flex space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {posts.length}
                </p>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Total Posts
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {publishedPostsCount}
                </p>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Published
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-zinc-400 dark:text-zinc-500">
                  {draftPostsCount}
                </p>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Drafts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Your Recent Posts
        </h2>
        <Link
          href="/dashboard/posts"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors flex items-center gap-1"
        >
          Manage in Dashboard
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">
            You haven't written anything yet.
          </p>
          <Link
            href="/dashboard/posts/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <div key={post.id} className="relative">
              <PostCard post={post as any} />
              {(!post.published || post.concept) && (
                <div className="absolute top-4 right-4 z-20 px-2.5 py-1 bg-zinc-900/80 backdrop-blur text-white text-xs font-semibold rounded-md uppercase tracking-wider">
                  Draft
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
