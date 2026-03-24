import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validations";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } },
    });

    if (!post || post.userId !== session.user.id) {
      return new Response("Not found", { status: 404 });
    }

    return Response.json(post);
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post || post.userId !== session.user.id) {
      return new Response("Not found", { status: 404 });
    }

    const json = await req.json();
    const body = postSchema.parse(json);

    // Delete existing tags and recreate to update
    await prisma.postTag.deleteMany({ where: { postId: id } });

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        content: body.content,
        published: body.published,
        concept: body.concept,
        publishDate: body.published && !body.concept ? (post.publishDate ?? new Date()) : null,
        tags: {
          create: body.tags.map(tagId => ({
            tag: { connect: { id: tagId } }
          }))
        }
      },
      include: { tags: { include: { tag: true } } },
    });

    return Response.json(updatedPost);
  } catch (error) {
    console.error(error);
    return new Response("Invalid request", { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post || post.userId !== session.user.id) {
      return new Response("Not found", { status: 404 });
    }

    await prisma.post.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
