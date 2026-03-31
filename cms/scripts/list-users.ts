import { prisma } from "@/lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, name: true },
    orderBy: { role: "asc" },
  });
  console.log("=== All users ===");
  users.forEach((u) => console.log(`[${u.role}] ${u.email} (${u.name})`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
