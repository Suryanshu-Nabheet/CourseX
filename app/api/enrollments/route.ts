import { NextResponse } from "next/server"
import { getSafeServerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getSafeServerSession()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("courseId")

    if (courseId) {
      // Check specific course enrollment
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: session.user.id,
            courseId,
          },
        },
      })

      return NextResponse.json({ enrolled: !!enrollment, enrollment })
    }

    // Get all enrollments for user
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: session.user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error("Error fetching enrollments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSafeServerSession()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { courseId } = await req.json()

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      )
    }

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    if (!course.published) {
      return NextResponse.json(
        { error: "Course is not published" },
        { status: 400 }
      )
    }

    // Check if course requires payment
    if (course.price > 0) {
      // Check if user has completed payment for this course
      const payment = await prisma.payment.findFirst({
        where: {
          userId: session.user.id,
          courseId,
          status: "completed",
        },
      })

      if (!payment) {
        return NextResponse.json(
          { 
            error: "Payment required",
            requiresPayment: true,
            courseId,
            price: course.price,
          },
          { status: 402 } // 402 Payment Required
        )
      }
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: session.user.id,
        courseId,
        progress: 0,
        completed: false,
      },
    })

    console.log(`✅ Enrollment created: ${enrollment.id} for user ${session.user.id} in course ${courseId}`)

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error) {
    console.error("Enrollment error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

