import { redirect } from "next/navigation";
import { syncUser } from "@/lib/user-sync";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { CreateCourseForm } from "@/components/courses/CreateCourseForm";

export default async function CreateCoursePage() {
  let user = await syncUser();

  // Auto-promote Student to Instructor
  if (user.role === "STUDENT") {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: "INSTRUCTOR" },
    });
  }

  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
    redirect("/dashboard/student");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="INSTRUCTOR" isAdmin={user.role === "ADMIN"} />
      <div className="flex-1 p-6 sm:p-8 lg:p-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
          Create New Course
        </h1>
        <CreateCourseForm />
      </div>
    </div>
  );
}
