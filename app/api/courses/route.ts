import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSlug } from "@/lib/utils"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await req.json()
    const { title, description, category, thumbnailUrl, introVideoUrl, difficulty, language, price, lessons } = data

    if (!title || !description || !category || !thumbnailUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Generate unique slug
    let slug = generateSlug(title)
    const existingCourse = await prisma.course.findUnique({
      where: { slug },
    })

    if (existingCourse) {
      slug = `${slug}-${Date.now()}`
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        thumbnailUrl,
        introVideoUrl: introVideoUrl || null,
        difficulty: difficulty || null,
        language: language || null,
        slug,
        instructorId: session.user.id,
        price: price !== undefined ? parseFloat(price) : 0,
        published: false,
        lessons: lessons || [],
      },
      include: {
        lessons: true,
      },
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error("Course creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

