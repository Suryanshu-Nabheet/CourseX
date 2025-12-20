import { prisma } from "@/lib/prisma";

export async function getInstructorStats(userId: string) {
  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: userId },
      include: {
        enrollments: true,
        reviews: true,
      },
    });

    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c) => c.published).length;
    const totalEnrollments = courses.reduce(
      (acc: number, c: any) => acc + c.enrollments.length,
      0
    );
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
      totalCourses,
      publishedCourses,
      totalEnrollments,
      averageRating,
    };
  } catch (error) {
    console.error("Error fetching instructor stats:", error);
    return {
      totalCourses: 0,
      publishedCourses: 0,
      totalEnrollments: 0,
      averageRating: 0,
    };
  }
}

export async function getRecentCourses(userId: string) {
  try {
    return await prisma.course.findMany({
      where: { instructorId: userId },
      include: {
        enrollments: true,
        reviews: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });
  } catch (error) {
    console.error("Error fetching recent courses:", error);
    return [];
  }
}

export async function getStudentEnrollments(userId: string) {
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

export async function getAdminStats() {
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
