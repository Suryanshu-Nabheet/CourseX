import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Certificate } from "@/components/courses/Certificate";

async function getEnrollment(slug: string, userId: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        instructor: {
          select: {
            name: true,
          },
        },
        enrollments: {
          where: {
            studentId: userId,
            completed: true,
          },
        },
      },
    });

    if (!course || course.enrollments.length === 0) {
      return null;
    }

    const enrollment = course.enrollments[0];
    const user = (await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    })) as { name: string } | null;

    return {
      course,
      enrollment,
      studentName: user?.name || "Student",
    };
  } catch (error) {
    console.error("Error fetching certificate data:", error);
    return null;
  }
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { slug } = await params;
  const data = await getEnrollment(slug, userId);

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <Certificate
        studentName={data.studentName}
        courseTitle={data.course.title}
        instructorName={data.course.instructor.name}
        completedDate={data.enrollment.updatedAt.toISOString()}
      />
    </div>
  );
}
