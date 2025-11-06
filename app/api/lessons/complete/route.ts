import { NextResponse } from "next/server"
import { getSafeServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getSafeServerSession()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { lessonId, courseId } = await req.json()

    if (!lessonId || !courseId) {
      return NextResponse.json(
        { error: "Lesson ID and Course ID are required" },
        { status: 400 }
      )
    }

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
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
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: "Not enrolled in this course" },
        { status: 403 }
      )
    }

    // Check if lesson exists in course
    const lesson = enrollment.course.lessons.find((l: any) => l.id === lessonId)
    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found in this course" },
        { status: 404 }
      )
    }

    // Get or create lesson completion record
    // Note: This assumes you have a LessonCompletion model. If not, we'll track via enrollment progress
    const totalLessons = enrollment.course.lessons.length
    
    // Calculate progress: count completed lessons
    // For now, we'll use a simple progress calculation
    // In a production system, you'd have a LessonCompletion table to track individual lessons
    const currentProgress = enrollment.progress || 0
    const progressPerLesson = totalLessons > 0 ? 100 / totalLessons : 0
    
    // Only increment if this is the first time completing this lesson
    // In production, check LessonCompletion table
    const newProgress = Math.min(
      Math.ceil(currentProgress + progressPerLesson),
      100
    )

    await prisma.enrollment.update({
      where: {
        id: enrollment.id,
      },
      data: {
        progress: newProgress,
        completed: newProgress >= 100,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ 
      success: true, 
      progress: newProgress,
      completed: newProgress >= 100,
    })
  } catch (error) {
    console.error("Lesson completion error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

