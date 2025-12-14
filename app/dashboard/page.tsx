import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // If user doesn't exist in local DB yet, maybe redirect to a setup page or default to student
  if (!user) {
    // Optional: create user here if strict syncing isn't set up
    // For now, redirect to safe default or error
    // Let's assume student
    redirect("/dashboard/student");
  }

  if (user.role === "INSTRUCTOR") {
    redirect("/dashboard/instructor");
  } else {
    redirect("/dashboard/student");
  }
}
