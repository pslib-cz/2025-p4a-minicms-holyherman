import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const hash = await bcrypt.hash("admin123", 10);

  // Delete accounts with null email (broken OAuth stubs)
  const deletedNull = await prisma.user.deleteMany({ where: { email: null } });
  console.log(`Deleted ${deletedNull.count} null-email accounts`);

  // Set David as ADMIN
  const david = await prisma.user.upsert({
    where: { email: "david.herman2006@gmail.com" },
    update: { role: "ADMIN", password: hash },
    create: { email: "david.herman2006@gmail.com", name: "David Heřman", role: "ADMIN", password: hash },
  });
  console.log(`David: [${david.role}] ${david.email}`);

  // Set Martin as USER
  const martin = await prisma.user.upsert({
    where: { email: "martin.holy.022@pslib.cz" },
    update: { role: "USER", password: hash },
    create: { email: "martin.holy.022@pslib.cz", name: "Martin Holý", role: "USER", password: hash },
  });
  console.log(`Martin: [${martin.role}] ${martin.email}`);

  console.log("\nPasswords for both set to: admin123");
  console.log("\n=== Final DB state ===");
  const all = await prisma.user.findMany({ select: { email: true, role: true, name: true } });
  all.forEach(u => console.log(`[${u.role}] ${u.email} (${u.name})`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
