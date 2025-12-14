import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { CreateCourseForm } from "@/components/courses/CreateCourseForm";

export default async function CreateCoursePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // Optional: Create user if missing or redirect to setup
  if (!user) {
    redirect("/");
  }

  if (user.role !== "INSTRUCTOR") {
    redirect("/dashboard/student");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="INSTRUCTOR" />
      <div className="flex-1 p-6 sm:p-8 lg:p-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
          Create New Course
        </h1>
        <CreateCourseForm />
      </div>
    </div>
  );
}
