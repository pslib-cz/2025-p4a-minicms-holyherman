import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { tagSchema } from "@/lib/validations";
import slugify from "slugify";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
    });
    return Response.json(tags);
  } catch (error) {
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
    const body = tagSchema.parse(json);

    const existingTag = await prisma.tag.findUnique({
      where: { name: body.name },
    });

    if (existingTag) {
      return new Response("Tag already exists", { status: 409 });
    }

    const slug = slugify(body.name, { lower: true, strict: true });

    const tag = await prisma.tag.create({
      data: {
        name: body.name,
        slug,
      },
    });

    return Response.json(tag, { status: 201 });
  } catch (error) {
    return new Response("Invalid request", { status: 400 });
  }
}
