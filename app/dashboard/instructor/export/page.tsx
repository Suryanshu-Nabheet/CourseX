import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { Download } from "lucide-react";

async function getExportData(userId: string) {
  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: userId },
      include: {
        enrollments: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        reviews: true,
      },
    });

    const enrollmentsData = courses.flatMap((course: any) =>
      course.enrollments.map((enrollment: any) => ({
        courseTitle: course.title,
        studentName: enrollment.user?.name || "Student",
        studentEmail: enrollment.user?.email || "",
        progress: enrollment.progress,
        completed: enrollment.completed ? "Yes" : "No",
        enrolledDate: enrollment.createdAt.toISOString(),
      }))
    );

    const coursesData = courses.map((course) => ({
      title: course.title,
      category: course.category,
      enrollments: course.enrollments.length,
      rating:
        course.reviews.length > 0
          ? course.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
            course.reviews.length
          : 0,
      reviews: course.reviews.length,
      published: course.published ? "Yes" : "No",
      createdAt: course.createdAt.toISOString(),
    }));

    return {
      enrollments: enrollmentsData,
      courses: coursesData,
    };
  } catch (error) {
    console.error("Error fetching export data:", error);
    return {
      enrollments: [],
      courses: [],
    };
  }
}

export default async function ExportPage() {
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

  const exportData = await getExportData(userId);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="INSTRUCTOR" />
      <div className="flex-1 p-6 sm:p-8 lg:p-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
          Export Data
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Enrollments Export</span>
                <Download className="h-5 w-5 text-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Export all student enrollments with progress data.
              </p>
              <p className="text-xs text-gray-500">
                {exportData.enrollments.length} enrollments available
              </p>
              <ExportButton
                data={exportData.enrollments}
                filename="enrollments"
                label="Export Enrollments"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Courses Export</span>
                <Download className="h-5 w-5 text-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Export course performance data and analytics.
              </p>
              <p className="text-xs text-gray-500">
                {exportData.courses.length} courses available
              </p>
              <ExportButton
                data={exportData.courses}
                filename="courses"
                label="Export Courses"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
