import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "INSTRUCTOR") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    const {
      title,
      description,
      category,
      thumbnailUrl,
      introVideoUrl,
      difficulty,
      language,
      price,
      lessons,
    } = data;

    if (!title || !description || !category || !thumbnailUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = generateSlug(title);
    const existingCourse = await prisma.course.findUnique({
      where: { slug },
    });

    if (existingCourse) {
      slug = `${slug}-${Date.now()}`;
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
        instructorId: userId,
        price: price !== undefined ? parseFloat(price) : 0,
        published: false,
        lessons: lessons
          ? {
              create: lessons.map((lesson: any) => ({
                ...lesson,
                resources: {
                  create: lesson.resources
                    ? lesson.resources.map((url: string) => ({ url }))
                    : [],
                },
              })),
            }
          : undefined,
      },
      include: {
        lessons: {
          include: {
            resources: true,
          },
        },
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Course creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
