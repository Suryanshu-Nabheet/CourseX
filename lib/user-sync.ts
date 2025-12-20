import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { appConfig } from "@/lib/config";

export async function syncUser() {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) {
    redirect("/");
  }

  const userId = user.id;

  // Check if user exists
  let dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  const isAdminEmail = email === appConfig.adminEmail;
  const role = isAdminEmail ? "ADMIN" : "STUDENT";

  if (!dbUser) {
    // Create new user
    dbUser = await prisma.user.create({
      data: {
        id: userId,
        email: email,
        name:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Student",
        image: user.imageUrl,
        role: role,
      },
    });
  } else {
    // Check if we need to promote to ADMIN
    if (isAdminEmail && dbUser.role !== "ADMIN") {
      dbUser = await prisma.user.update({
        where: { id: userId },
        data: { role: "ADMIN" },
      });
    }
  }

  return dbUser;
}
