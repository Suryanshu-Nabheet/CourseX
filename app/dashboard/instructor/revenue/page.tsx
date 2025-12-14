import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, BookOpen } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { paymentConfig } from "@/lib/payments";

async function getRevenueData(instructorId: string) {
  try {
    // Get all courses by instructor
    const courses = await prisma.course.findMany({
      where: { instructorId },
      include: {
        payments: {
          where: { status: "completed" },
        },
      },
    });

    // Calculate revenue
    let totalRevenue = 0;
    let totalPlatformFee = 0;
    let totalInstructorEarnings = 0;
    let totalSales = 0;

    courses.forEach((course) => {
      course.payments.forEach((payment) => {
        totalSales++;
        totalRevenue += payment.amount;
        const platformFee =
          payment.amount * (paymentConfig.platformFeePercent / 100);
        const instructorEarnings = payment.amount - platformFee;
        totalPlatformFee += platformFee;
        totalInstructorEarnings += instructorEarnings;
      });
    });

    // Get recent sales
    const recentSales = await prisma.payment.findMany({
      where: {
        course: {
          instructorId,
        },
        status: "completed",
      },
      include: {
        course: {
          select: {
            title: true,
            slug: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Course-wise revenue
    const courseRevenue = courses
      .map((course) => {
        const courseSales = course.payments.length;
        const courseRevenue = course.payments.reduce(
          (sum, p) => sum + p.amount,
          0
        );
        const coursePlatformFee =
          courseRevenue * (paymentConfig.platformFeePercent / 100);
        const courseEarnings = courseRevenue - coursePlatformFee;

        return {
          courseId: course.id,
          courseTitle: course.title,
          courseSlug: course.slug,
          sales: courseSales,
          revenue: courseRevenue,
          platformFee: coursePlatformFee,
          earnings: courseEarnings,
        };
      })
      .filter((c) => c.sales > 0)
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue,
      totalPlatformFee,
      totalInstructorEarnings,
      totalSales,
      recentSales,
      courseRevenue,
    };
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return {
      totalRevenue: 0,
      totalPlatformFee: 0,
      totalInstructorEarnings: 0,
      totalSales: 0,
      recentSales: [],
      courseRevenue: [],
    };
  }
}

export default async function RevenuePage() {
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

  const revenueData = await getRevenueData(userId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Revenue & Analytics
          </h1>
          <p className="text-gray-600">Track your earnings and course sales</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${revenueData.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                From all course sales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Your Earnings
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${revenueData.totalInstructorEarnings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                After {paymentConfig.platformFeePercent}% platform fee
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueData.totalSales}</div>
              <p className="text-xs text-muted-foreground">
                Completed purchases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Platform Fee
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${revenueData.totalPlatformFee.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Platform commission
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Course Revenue Breakdown */}
        {revenueData.courseRevenue.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Revenue by Course</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.courseRevenue.map((course) => (
                  <div
                    key={course.courseId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{course.courseTitle}</h3>
                      <p className="text-sm text-gray-600">
                        {course.sales} sales
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${course.earnings.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${course.revenue.toFixed(2)} total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Sales */}
        {revenueData.recentSales.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">{sale.course.title}</h3>
                      <p className="text-sm text-gray-600">
                        {sale.user.name || sale.user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(sale.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${sale.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        $
                        {(
                          sale.amount -
                          sale.amount * (paymentConfig.platformFeePercent / 100)
                        ).toFixed(2)}{" "}
                        earned
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {revenueData.totalSales === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600 mb-4">
                No sales yet. Start selling your courses to see revenue here!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
