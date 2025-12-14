import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

async function getAdminStats() {
  try {
    const [totalUsers, totalCourses, totalEnrollments, totalRevenue] =
      await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.enrollment.count(),
        prisma.course.aggregate({
          _sum: {
            price: true,
          },
        }),
      ]);

    return {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue: totalRevenue._sum.price || 0,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      totalUsers: 0,
      totalCourses: 0,
      totalEnrollments: 0,
      totalRevenue: 0,
    };
  }
}

export default async function AdminDashboard() {
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

  if (user.role !== "ADMIN") {
    redirect("/dashboard/student");
  }

  const stats = await getAdminStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 lg:p-12">
      <div className="container mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                All registered users
              </p>
            </CardContent>
          </Card>

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
                Published and draft
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Enrollments
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">
                Course enrollments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Platform revenue</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Features</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Advanced admin features including user management, content
              moderation, and analytics will be available here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
