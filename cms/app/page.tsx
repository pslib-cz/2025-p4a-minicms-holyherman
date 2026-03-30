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
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
      <div className="text-center mb-20">
        <h1 className="font-[var(--font-display)] text-5xl sm:text-6xl font-extrabold tracking-tight text-on-surface mb-5" style={{ letterSpacing: "-0.02em" }}>
          The MiniCMS Blog
        </h1>
        <p className="text-xl text-on-surface-variant max-w-2xl mx-auto font-[var(--font-body)] leading-relaxed">
          Discover the latest articles, tutorials, and insights published by our community.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar for Filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24 bg-surface-lowest p-7 rounded-3xl shadow-ambient">
            <h2 className="font-[var(--font-display)] text-lg font-bold text-on-surface mb-5">Search</h2>
            <form action="/" method="GET" className="mb-10">
              {tagFilter && <input type="hidden" name="tag" value={tagFilter} />}
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search articles..."
                className="w-full rounded-xl bg-surface-lowest ghost-border ghost-border-focus text-sm text-on-surface px-4 py-2.5 outline-none transition-colors font-[var(--font-body)] placeholder:text-on-surface-variant/50"
              />
              <button type="submit" className="mt-3 w-full gradient-primary text-on-primary font-semibold py-2.5 rounded-full text-sm transition-opacity hover:opacity-90">
                Search
              </button>
            </form>

            <h2 className="font-[var(--font-display)] text-lg font-bold text-on-surface mb-5">Tags</h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/?search=${search}`}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${!tagFilter ? "gradient-primary text-on-primary" : "bg-surface-low text-on-surface-variant hover:text-primary"}`}
              >
                All
              </Link>
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/?tag=${tag.slug}&search=${search}`}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${tagFilter === tag.slug ? "gradient-primary text-on-primary" : "bg-surface-low text-on-surface-variant hover:text-primary"}`}
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
            <div className="text-center py-28 bg-surface-lowest rounded-3xl shadow-ambient">
              <p className="text-lg text-on-surface-variant font-[var(--font-body)]">No matching articles found.</p>
              {(search || tagFilter) && (
                <Link href="/" className="text-primary hover:text-primary-container font-semibold mt-4 inline-block transition-colors">
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
            <div className="mt-16 flex justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Link
                  key={i}
                  href={`/?page=${i + 1}&search=${search}&tag=${tagFilter}`}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${page === i + 1 ? "gradient-primary text-on-primary" : "bg-surface-lowest text-on-surface-variant shadow-ambient hover:text-primary"}`}
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
