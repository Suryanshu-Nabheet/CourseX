import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { ExportButton } from "@/components/dashboard/ExportButton";

async function getAnalytics(userId: string) {
  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: userId },
      include: {
        enrollments: true,
        reviews: true,
      },
    });

    const totalEnrollments = courses.reduce(
      (acc: number, c: any) => acc + c.enrollments.length,
      0
    );
    const totalRevenue = 0; // Placeholder for future payment integration
    const averageRating =
      courses.length > 0
        ? courses.reduce((acc: number, c: any) => {
            const courseRating =
              c.reviews.length > 0
                ? c.reviews.reduce(
                    (rAcc: number, r: any) => rAcc + r.rating,
                    0
                  ) / c.reviews.length
                : 0;
            return acc + courseRating;
          }, 0) / courses.length
        : 0;

    return {
      totalEnrollments,
      totalRevenue,
      averageRating,
      totalCourses: courses.length,
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      totalEnrollments: 0,
      totalRevenue: 0,
      averageRating: 0,
      totalCourses: 0,
    };
  }
}

export default async function AnalyticsPage() {
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

  const analytics = await getAnalytics(userId);

  // Get course-level analytics
  let courseAnalytics: any[] = [];
  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: userId },
      include: {
        enrollments: true,
        reviews: true,
      },
    });

    courseAnalytics = courses.map((course) => ({
      title: course.title,
      enrollments: course.enrollments.length,
      rating:
        course.reviews.length > 0
          ? course.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
            course.reviews.length
          : 0,
      reviews: course.reviews.length,
    }));
  } catch (error) {
    console.error("Error fetching course analytics:", error);
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="INSTRUCTOR" />
      <div className="flex-1 p-6 sm:p-8 lg:p-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Analytics
          </h1>
          {courseAnalytics.length > 0 && (
            <ExportButton
              data={courseAnalytics}
              filename="course-analytics"
              label="Export Data"
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {analytics.totalEnrollments}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {analytics.averageRating.toFixed(1)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${analytics.totalRevenue}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Payment integration coming soon
              </p>
            </CardContent>
          </Card>
        </div>

        {courseAnalytics.length > 0 && (
          <AnalyticsChart
            title="Course Enrollments"
            data={courseAnalytics.slice(0, 5).map((course) => ({
              label:
                course.title.length > 30
                  ? course.title.substring(0, 30) + "..."
                  : course.title,
              value: course.enrollments,
            }))}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Revenue tracking and analytics will be available after payment
              integration.
            </p>
            <div className="space-y-2 text-sm">
              <p className="font-semibold">Payment Integration Ready:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Stripe integration placeholder configured</li>
                <li>Course price field ready in database</li>
                <li>Revenue split system designed</li>
                <li>Payment webhook endpoints ready for implementation</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
