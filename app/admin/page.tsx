import { redirect } from "next/navigation";
import { syncUser } from "@/lib/user-sync";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp, DollarSign, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

import {
  getAdminStats,
  getInstructorStats,
  getRecentCourses,
  getStudentEnrollments,
} from "@/lib/dashboard-data";

export default async function AdminDashboard() {
  const user = await syncUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard/student");
  }

  // Fetch all data in parallel
  const [adminStats, instructorStats, recentCourses, enrollments] =
    await Promise.all([
      getAdminStats(),
      getInstructorStats(user.id),
      getRecentCourses(user.id),
      getStudentEnrollments(user.id),
    ]);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 sm:p-8 lg:p-12">
      <div className="container mx-auto max-w-7xl space-y-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your platform, courses, and students from one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              System Operational
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium border border-purple-200">
              Super Admin
            </span>
          </div>
        </div>

        {/* Quick Actions & Platform Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions Panel */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/dashboard/instructor/create">
                <Button
                  className="w-full h-auto py-4 flex flex-col items-center justify-center gap-2"
                  variant="outline"
                >
                  <Plus className="h-6 w-6 text-primary" />
                  <span className="font-medium">Create Course</span>
                </Button>
              </Link>
              <Link href="/dashboard/instructor">
                <Button
                  className="w-full h-auto py-4 flex flex-col items-center justify-center gap-2"
                  variant="outline"
                >
                  <Users className="h-6 w-6 text-blue-600" />
                  <span className="font-medium">My Teaching</span>
                </Button>
              </Link>
              <Link href="/courses">
                <Button
                  className="w-full h-auto py-4 flex flex-col items-center justify-center gap-2"
                  variant="outline"
                >
                  <BookOpen className="h-6 w-6 text-green-600" />
                  <span className="font-medium">Browse Catalog</span>
                </Button>
              </Link>
              <Link href="/dashboard/student">
                <Button
                  className="w-full h-auto py-4 flex flex-col items-center justify-center gap-2"
                  variant="outline"
                >
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                  <span className="font-medium">My Learning</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Platform Stats */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Platform Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {adminStats.totalUsers}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Courses
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {adminStats.totalCourses}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Enrollments
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {adminStats.totalEnrollments}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${adminStats.totalRevenue.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Instructor Section */}
          <section className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  My Teaching Stats
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {instructorStats.totalCourses}
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
                  Courses
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {instructorStats.totalEnrollments}
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
                  Students
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {instructorStats.averageRating.toFixed(1)}
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
                  Rating
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                Recent Courses
              </h3>
              {recentCourses.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No courses created yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentCourses.map((course: any) => (
                    <div
                      key={course.id}
                      className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100"
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {course.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              course.published
                                ? "bg-green-500"
                                : "bg-yellow-500"
                            }`}
                          ></span>
                          <p className="text-xs text-gray-500">
                            {course.price ? `$${course.price}` : "Free"}
                          </p>
                        </div>
                      </div>
                      <Link href={`/dashboard/instructor/edit/${course.id}`}>
                        <Button variant="ghost" size="sm" className="h-8">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Student Section */}
          <section className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  My Learning
                </h2>
              </div>
              <Link href="/courses">
                <Button variant="ghost" size="sm">
                  Browse All
                </Button>
              </Link>
            </div>

            {enrollments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-3 bg-gray-100 rounded-full mb-3">
                  <BookOpen className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium">No enrollments yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Explore courses to start learning.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.slice(0, 3).map((enrollment: any) => (
                  <Link
                    key={enrollment.id}
                    href={`/courses/learn/${enrollment.course.id}`}
                    className="block group"
                  >
                    <div className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                        {/* Ideally use Next Image, simpler for now */}
                        <div className="w-full h-full bg-gray-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                          {enrollment.course.title}
                        </h4>
                        <div className="flex items-center justify-between mt-2">
                          <div className="w-full max-w-[140px] bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full"
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-500 ml-3">
                            {enrollment.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
