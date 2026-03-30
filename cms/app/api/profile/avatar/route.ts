import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check that user is a credentials user (has password, not OAuth)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    return new Response("Only credentials users can change their avatar", { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("avatar") as File | null;

  if (!file) {
    return new Response("No file provided", { status: 400 });
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return new Response("File must be an image", { status: 400 });
  }

  // Limit to 1MB
  if (file.size > 1024 * 1024) {
    return new Response("Image must be less than 1MB", { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: dataUrl },
  });

  return Response.json({ image: dataUrl });
}
