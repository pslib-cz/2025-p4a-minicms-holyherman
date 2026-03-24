import { prisma } from "@/lib/prisma";
import PostCard from "@/app/components/PostCard";
import Link from "next/link";

// ISR: revalidate this page every 60 seconds
export const revalidate = 60;

export default async function Home(props: {
  searchParams?: Promise<{ search?: string; tag?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams?.search || "";
  const tagFilter = searchParams?.tag || "";
  const page = parseInt(searchParams?.page || "1");
  const limit = 6;
  const skip = (page - 1) * limit;

  // Build the query
  const whereClause: any = {
    published: true,
    concept: false,
  };

  if (search) {
    whereClause.OR = [
      { title: { contains: search } },
      { content: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (tagFilter) {
    whereClause.tags = {
      some: { tag: { slug: tagFilter } },
    };
  }

  const [posts, total, tags] = await Promise.all([
    prisma.post.findMany({
      where: whereClause,
      include: {
        user: true,
        tags: { include: { tag: true } },
      },
      orderBy: { publishDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.post.count({ where: whereClause }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4">
          The MiniCMS Blog
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Discover the latest articles, tutorials, and insights published by our community.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar for Filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Search</h2>
            <form action="/" method="GET" className="mb-8">
              {tagFilter && <input type="hidden" name="tag" value={tagFilter} />}
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search articles..."
                className="w-full rounded-lg border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white px-4 py-2"
              />
              <button type="submit" className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">
                Search
              </button>
            </form>

            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/?search=${search}`}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!tagFilter ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}
              >
                All
              </Link>
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/?tag=${tag.slug}&search=${search}`}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${tagFilter === tag.slug ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          {posts.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
              <p className="text-lg text-zinc-500 dark:text-zinc-400">No matching articles found.</p>
              {(search || tagFilter) && (
                <Link href="/" className="text-blue-600 hover:text-blue-500 font-medium mt-4 inline-block">
                  Clear filters
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`/?page=${i + 1}&search=${search}&tag=${tagFilter}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? "bg-blue-600 text-white" : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
