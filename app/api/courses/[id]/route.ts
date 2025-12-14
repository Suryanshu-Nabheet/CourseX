import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
          include: { resources: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    // Check role from DB
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { lessons, published, price, ...courseData } = data;

    // Check if course exists and user owns it
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course || course.instructorId !== userId) {
      return NextResponse.json(
        { error: "Course not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update course
    const updateData: any = { ...courseData };
    if (published !== undefined) {
      updateData.published = published;
    }
    if (price !== undefined) {
      updateData.price = parseFloat(price);
    }

    // Remove unwanted fields from updateData if they exist
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.instructorId;

    await prisma.course.update({
      where: { id },
      data: updateData,
    });

    // Handle lessons update separately
    if (lessons && Array.isArray(lessons)) {
      // Delete existing lessons
      await prisma.lesson.deleteMany({
        where: { courseId: id },
      });

      // Create new lessons
      for (const lesson of lessons) {
        await prisma.lesson.create({
          data: {
            title: lesson.title,
            description: lesson.description,
            videoUrl: lesson.videoUrl,
            order: lesson.order || 1,
            courseId: id,
            resources: {
              create: lesson.resources
                ? lesson.resources.map((url: string) => ({ url }))
                : [],
            },
          },
        });
      }
    }

    const courseWithLessons = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          include: { resources: true },
        },
      },
    });

    return NextResponse.json(courseWithLessons);
  } catch (error) {
    console.error("Course update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
