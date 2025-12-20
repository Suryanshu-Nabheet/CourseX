import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, courseId } = await req.json();

    if (!lessonId || !courseId) {
      return NextResponse.json(
        { error: "Lesson ID and Course ID are required" },
        { status: 400 }
      );
    }

    // Verify enrollment
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
            },
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 403 }
      );
    }

    // Check if lesson exists in course
    const lesson = enrollment.course.lessons.find(
      (l: any) => l.id === lessonId
    );
    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found in this course" },
        { status: 404 }
      );
    }

    // Create or update LessonProgress
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        completed: true,
      },
      create: {
        userId,
        lessonId,
        completed: true,
      },
    });

    // Calculate total progress
    const totalLessons = enrollment.course.lessons.length;
    const completedCount = await prisma.lessonProgress.count({
      where: {
        userId,
        lessonId: {
          in: enrollment.course.lessons.map((l: any) => l.id),
        },
        completed: true,
      },
    });

    const newProgress =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // Update enrollment
    await prisma.enrollment.update({
      where: {
        id: enrollment.id,
      },
      data: {
        progress: newProgress,
        completed: newProgress >= 100,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      progress: newProgress,
      completed: newProgress >= 100,
    });
  } catch (error) {
    console.error("Lesson completion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
