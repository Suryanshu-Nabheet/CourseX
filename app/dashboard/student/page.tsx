import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Play, Clock, Award } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

async function getEnrollments(userId: string) {
  try {
    return await prisma.enrollment.findMany({
      where: { studentId: userId },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                name: true,
                image: true,
              },
            },
            lessons: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return [];
  }
}

export default async function StudentDashboard() {
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

  if (user.role !== "STUDENT") {
    redirect("/dashboard/instructor");
  }

  const enrollments = await getEnrollments(userId);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="STUDENT" />
      <div className="flex-1 p-6 sm:p-8 lg:p-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
          My Courses
        </h1>

        {enrollments.length === 0 ? (
          <EmptyState
            icon={Play}
            title="No enrolled courses"
            description="Start your learning journey by enrolling in courses."
            action={{
              label: "Browse Courses",
              href: "/courses",
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              const totalLessons = course.lessons.length;
              const completedLessons = Math.floor(
                (enrollment.progress / 100) * totalLessons
              );

              return (
                <Card key={enrollment.id} className="overflow-hidden">
                  <div className="relative w-full h-48 bg-gray-200">
                    <Image
                      src={course.thumbnailUrl || "/placeholder-course.jpg"}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      {course.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      By {course.instructor.name}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {enrollment.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                          {completedLessons} / {totalLessons} lessons
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {totalLessons * 10} min
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Link
                        href={`/courses/learn/${course.id}`}
                        className="block"
                      >
                        <Button className="w-full">
                          <Play className="mr-2 h-4 w-4" />
                          {enrollment.progress === 100
                            ? "Review Course"
                            : "Continue Learning"}
                        </Button>
                      </Link>
                      {enrollment.progress === 100 && (
                        <Link
                          href={`/courses/${course.slug}/certificate`}
                          className="block"
                        >
                          <Button variant="outline" className="w-full">
                            <Award className="mr-2 h-4 w-4" />
                            View Certificate
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
