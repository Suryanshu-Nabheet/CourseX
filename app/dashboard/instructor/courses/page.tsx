import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Eye } from "lucide-react";

async function getInstructorCourses(userId: string) {
  try {
    return await prisma.course.findMany({
      where: { instructorId: userId },
      include: {
        enrollments: true,
        reviews: true,
        lessons: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    return [];
  }
}

export default async function InstructorCoursesPage() {
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

  const courses = await getInstructorCourses(userId);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="INSTRUCTOR" />
      <div className="flex-1 p-6 sm:p-8 lg:p-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            My Courses
          </h1>
          <Link href="/dashboard/instructor/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </Link>
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600 mb-4">
                You haven&apos;t created any courses yet.
              </p>
              <Link href="/dashboard/instructor/create">
                <Button>Create Your First Course</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const rating =
                course.reviews.length > 0
                  ? course.reviews.reduce(
                      (acc: number, r: any) => acc + r.rating,
                      0
                    ) / course.reviews.length
                  : 0;

              return (
                <Card key={course.id} className="overflow-hidden">
                  <div className="relative w-full h-48 bg-gray-200">
                    <Image
                      src={course.thumbnailUrl || "/placeholder-course.jpg"}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          course.published
                            ? "bg-green-500 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {course.published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      {course.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {course.lessons.length} lessons •{" "}
                      {course.enrollments.length} students
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        {rating > 0 && (
                          <span className="text-yellow-600">
                            ⭐ {rating.toFixed(1)}
                          </span>
                        )}
                        <span className="text-gray-600 ml-2">
                          ({course.reviews.length} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/dashboard/instructor/edit/${course.id}`}
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      {course.published && (
                        <Link
                          href={`/courses/${course.slug}`}
                          className="flex-1"
                        >
                          <Button variant="outline" className="w-full">
                            <Eye className="mr-2 h-4 w-4" />
                            View
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
