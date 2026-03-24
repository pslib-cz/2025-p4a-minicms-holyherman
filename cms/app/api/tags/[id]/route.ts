import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      return new Response("Not found", { status: 404 });
    }

    await prisma.tag.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
