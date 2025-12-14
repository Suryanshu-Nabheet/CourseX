import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const userId = searchParams.get("userId");

    if (courseId) {
      const reviews = await prisma.review.findMany({
        where: { courseId },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(reviews);
    }

    if (userId) {
      const reviews = await prisma.review.findMany({
        where: { userId },
        include: {
          course: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(reviews);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, rating, comment } = await req.json();

    if (!courseId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Must be enrolled to review" },
        { status: 403 }
      );
    }

    // Check if already reviewed
    const existing = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already reviewed this course" },
        { status: 400 }
      );
    }

    // Get user details for denormalization if needed
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId,
        userName: user?.name,
        userImage: user?.image,
        courseId,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
