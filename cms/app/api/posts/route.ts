import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validations";
import slugify from "slugify";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { tags: { include: { tag: true } } },
      }),
      prisma.post.count({ where: { userId: session.user.id } }),
    ]);

    return Response.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const json = await req.json();
    const body = postSchema.parse(json);

    // Generate slug from title
    let baseSlug = slugify(body.title, { lower: true, strict: true });
    let slug = baseSlug;
    
    // Ensure slug is unique
    let counter = 1;
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const post = await prisma.post.create({
      data: {
        title: body.title,
        description: body.description,
        content: body.content,
        published: body.published,
        concept: body.concept,
        publishDate: body.published && !body.concept ? new Date() : null,
        slug,
        userId: session.user.id,
        tags: {
          create: body.tags.map((tagId) => ({
            tag: { connect: { id: tagId } }
          }))
        }
      },
      include: { tags: { include: { tag: true } } },
    });

    return Response.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return new Response("Invalid request", { status: 400 });
  }
}
