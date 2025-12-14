import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { EditCourseForm } from "@/components/courses/EditCourseForm";

async function getCourse(courseId: string, userId: string) {
  try {
    return await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId: userId,
      },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: {
            resources: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching course for editing:", error);
    return null;
  }
}

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const { id } = await params;
  const course = await getCourse(id, userId);

  if (!course) {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="INSTRUCTOR" />
      <div className="flex-1 p-6 sm:p-8 lg:p-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
          Edit Course
        </h1>
        <EditCourseForm
          course={{
            ...course,
            lessons: course.lessons.map((lesson: any) => ({
              ...lesson,
              description: lesson.description || "",
              resources: lesson.resources
                ? lesson.resources.map((r: any) => r.url)
                : [],
            })),
          }}
        />
      </div>
    </div>
  );
}
