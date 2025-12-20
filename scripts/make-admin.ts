import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.log("Usage: tsx scripts/make-admin.ts <email>");
    const users = await prisma.user.findMany();
    console.log("\nAvailable users:");
    users.forEach((u) => console.log(`- ${u.email} (${u.role})`));
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`User with email ${email} not found.`);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log(`✅ User ${updated.email} is now an ${updated.role}!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
