import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const email = "david.herman2006@gmail.com";
  const testPassword = "admin123";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("❌ User NOT found in DB!");
    return;
  }

  console.log(`✅ User found: ${user.email} [${user.role}]`);
  console.log(`   Has password hash: ${user.password ? "YES" : "NO"}`);
  console.log(`   Password hash: ${user.password?.substring(0, 20)}...`);

  if (user.password) {
    const valid = await bcrypt.compare(testPassword, user.password);
    console.log(`   Password "admin123" matches: ${valid ? "✅ YES" : "❌ NO"}`);
  }

  // Force reset password
  const hash = await bcrypt.hash(testPassword, 10);
  await prisma.user.update({ where: { email }, data: { password: hash } });
  console.log(`\n✅ Password reset to "admin123" done.`);

  // Verify again
  const updated = await prisma.user.findUnique({ where: { email } });
  const valid2 = await bcrypt.compare(testPassword, updated!.password!);
  console.log(`   Verification after reset: ${valid2 ? "✅ PASS" : "❌ FAIL"}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
