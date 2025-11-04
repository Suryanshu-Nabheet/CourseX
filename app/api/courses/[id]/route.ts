import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        lessons: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const data = await req.json()
    const { lessons, published, price, ...courseData } = data

    // Check if course exists and user owns it
    const course = await prisma.course.findUnique({
      where: { id },
    })

    if (!course || course.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: "Course not found or unauthorized" },
        { status: 404 }
      )
    }

    // Update course
    const updateData: any = { ...courseData }
    if (published !== undefined) {
      updateData.published = published
    }
    if (price !== undefined) {
      updateData.price = parseFloat(price)
    }

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updateData,
    })

    // Handle lessons update separately
    if (lessons && Array.isArray(lessons)) {
      // Delete existing lessons
      await prisma.lesson.deleteMany({
        where: { courseId: id },
      })

      // Create new lessons
      for (const lesson of lessons) {
        await prisma.lesson.create({
          data: {
            ...lesson,
            courseId: id,
            order: lesson.order || 1,
          },
        })
      }
    }

    const courseWithLessons = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
    })

    return NextResponse.json(courseWithLessons)
  } catch (error) {
    console.error("Course update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
