import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const posts = await prisma.post.findMany({
      where: { published: true, concept: false },
      orderBy: { publishDate: "desc" },
    });

    const postUrls = posts.map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: post.updatedAt,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      },
      ...postUrls,
    ];
  } catch {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      },
    ];
  }
}
