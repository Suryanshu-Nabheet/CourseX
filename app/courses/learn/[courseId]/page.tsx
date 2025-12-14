import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { CoursePlayer } from "@/components/courses/CoursePlayer";

async function getCourse(courseId: string, userId: string, retryCount = 0) {
  try {
    // First try to find enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: {
                resources: true,
              },
            },
            instructor: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (enrollment?.course) {
      console.log(
        `✅ Enrollment found for user ${userId} in course ${courseId}`
      );
      return (enrollment as any).course;
    }

    // Retry once if enrollment not found (might be a race condition)
    if (retryCount === 0) {
      console.log(
        `⏳ Enrollment not found, retrying... (courseId: ${courseId}, userId: ${userId})`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      return getCourse(courseId, userId, 1);
    }

    // If enrollment still not found after retry, check if course exists to get slug for redirect
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        slug: true,
        title: true,
      },
    });

    // If course exists but no enrollment, return course info for redirect
    if (course) {
      console.warn(
        `⚠️ Course ${courseId} exists but user ${userId} is not enrolled (after retry)`
      );
      return { redirectTo: `/courses/${course.slug}`, courseSlug: course.slug };
    }

    return null;
  } catch (error) {
    console.error("Error fetching course for learning:", error);
    return null;
  }
}

export default async function LearnCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { courseId } = await params;
  const { lesson } = await searchParams;

  if (!courseId) {
    notFound();
  }

  console.log(
    `🔍 Checking enrollment for courseId: ${courseId}, userId: ${userId}`
  );

  const courseData = await getCourse(courseId, userId);

  console.log(
    `📊 Course data result:`,
    courseData
      ? courseData.redirectTo
        ? "Redirect needed"
        : "Course found"
      : "No course data"
  );

  if (!courseData) {
    // Course doesn't exist - redirect to courses page
    redirect(`/courses`);
  }

  // Check if we need to redirect to course detail page (user not enrolled)
  if ("redirectTo" in courseData && courseData.redirectTo) {
    // Redirect to course detail page with a message that user needs to enroll
    redirect(`${courseData.redirectTo}?enroll=true`);
  }

  // User is enrolled - proceed with learning
  const course = courseData as any;

  if (!course.lessons || course.lessons.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">No Lessons Available</h2>
          <p className="text-gray-600 mb-6">
            This course doesn&apos;t have any lessons yet.
          </p>
          <a
            href={`/courses/${course.slug}`}
            className="text-primary hover:underline"
          >
            ← Back to Course
          </a>
        </div>
      </div>
    );
  }

  const lessonId = lesson || course.lessons[0]?.id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentLesson =
    (course.lessons as any[]).find((l: any) => l.id === lessonId) ||
    course.lessons[0];

  if (!currentLesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Lesson Not Found</h2>
          <p className="text-gray-600 mb-6">
            The requested lesson could not be found.
          </p>
          <a
            href={`/courses/learn/${course.id}`}
            className="text-primary hover:underline"
          >
            Go to First Lesson
          </a>
        </div>
      </div>
    );
  }

  return (
    <CoursePlayer
      course={course}
      currentLesson={currentLesson}
      allLessons={course.lessons}
    />
  );
}
