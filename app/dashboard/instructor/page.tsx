import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { syncUser } from "@/lib/user-sync";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Users, TrendingUp, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

import { getInstructorStats, getRecentCourses } from "@/lib/dashboard-data";

export default async function InstructorDashboard() {
  let user = await syncUser();

  // Auto-promote Student to Instructor on visiting this page
  if (user.role === "STUDENT") {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: "INSTRUCTOR" },
    });
  }

  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
    redirect("/dashboard/student");
  }

  const stats = await getInstructorStats(user.id);
  const recentCourses = await getRecentCourses(user.id);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="INSTRUCTOR" isAdmin={user.role === "ADMIN"} />
      <div className="flex-1 p-6 sm:p-8 lg:p-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Dashboard
          </h1>
          <Link href="/dashboard/instructor/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                {stats.publishedCourses} published
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">Enrollments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageRating.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">Out of 5.0</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0</div>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCourses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No courses yet"
                description="Create your first course to start teaching and earning."
                action={{
                  label: "Create Your First Course",
                  href: "/dashboard/instructor/create",
                }}
              />
            ) : (
              <div className="space-y-4">
                {recentCourses.map((course) => {
                  const rating =
                    course.reviews.length > 0
                      ? course.reviews.reduce(
                          (acc: number, r: any) => acc + r.rating,
                          0
                        ) / course.reviews.length
                      : 0;

                  return (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{course.title}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              course.published
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {course.published ? "Published" : "Draft"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{course.enrollments.length} enrollments</span>
                          <span>{course.reviews.length} reviews</span>
                          {rating > 0 && <span>⭐ {rating.toFixed(1)}</span>}
                        </div>
                      </div>
                      <Link href={`/dashboard/instructor/edit/${course.id}`}>
                        <Button variant="outline">Edit</Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
