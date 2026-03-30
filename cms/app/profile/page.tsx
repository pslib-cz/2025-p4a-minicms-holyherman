import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PostCard from "@/app/components/PostCard";
import AvatarUpload from "@/app/components/AvatarUpload";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get user ID from session - try id first, fall back to email lookup
  let userId = session.user.id;
  if (!userId && session.user.email) {
    const found = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    userId = found?.id;
  }

  if (!userId) {
    redirect("/login");
  }

  const [user, posts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true, password: true },
    }),
    prisma.post.findMany({
      where: { userId },
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

  const isCredentialsUser = !!user.password;
  const publishedPostsCount = posts.filter(
    (p) => p.published && !p.concept,
  ).length;
  const draftPostsCount = posts.length - publishedPostsCount;

  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
      <div className="bg-surface-lowest rounded-3xl shadow-ambient overflow-hidden mb-16">
        <div className="h-36 gradient-primary"></div>
        <div className="px-6 sm:px-10 pb-10">
          <div className="relative flex justify-between items-end -mt-14 sm:-mt-16 mb-8">
            <div className="p-1.5 bg-surface-lowest rounded-full inline-block">
              {isCredentialsUser ? (
                <AvatarUpload currentImage={user.image} userName={user.name} />
              ) : user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User Profile"}
                  width={120}
                  height={120}
                  className="rounded-full w-24 h-24 sm:w-32 sm:h-32 object-cover bg-surface-low"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary-fixed/30 flex items-center justify-center text-4xl text-primary font-bold">
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
                className="px-5 py-2.5 rounded-full bg-secondary-container/20 text-secondary hover:bg-secondary-container/30 transition-colors font-semibold text-sm flex items-center gap-2"
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
            <div>
              <h1 className="font-[var(--font-display)] text-3xl font-bold text-on-surface mb-1">
                {user.name}
              </h1>
              <p className="text-on-surface-variant font-[var(--font-body)]">{user.email}</p>
            </div>

            <div className="flex gap-8">
              <div className="text-center">
                <p className="font-[var(--font-display)] text-2xl font-bold text-on-surface">
                  {posts.length}
                </p>
                <p className="text-sm font-medium text-on-surface-variant font-[var(--font-body)]">
                  Total Posts
                </p>
              </div>
              <div className="text-center">
                <p className="font-[var(--font-display)] text-2xl font-bold text-primary">
                  {publishedPostsCount}
                </p>
                <p className="text-sm font-medium text-on-surface-variant font-[var(--font-body)]">
                  Published
                </p>
              </div>
              <div className="text-center">
                <p className="font-[var(--font-display)] text-2xl font-bold text-secondary">
                  {draftPostsCount}
                </p>
                <p className="text-sm font-medium text-on-surface-variant font-[var(--font-body)]">
                  Drafts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-10">
        <h2 className="font-[var(--font-display)] text-2xl font-bold text-on-surface">
          Your Recent Posts
        </h2>
        <Link
          href="/dashboard/posts"
          className="text-sm font-semibold text-primary hover:text-primary-container transition-colors flex items-center gap-1"
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
        <div className="text-center py-20 bg-surface-lowest rounded-3xl shadow-ambient">
          <p className="text-on-surface-variant mb-5 font-[var(--font-body)]">
            You haven't written anything yet.
          </p>
          <Link
            href="/dashboard/posts/new"
            className="inline-flex items-center px-6 py-2.5 rounded-full gradient-primary text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity"
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
                <div className="absolute top-5 right-5 z-20 px-3 py-1.5 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full uppercase tracking-wider">
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
