import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { appConfig } from "@/lib/config";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (courseId) {
      // Check specific course enrollment
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: userId,
            courseId,
          },
        },
      });

      return NextResponse.json({ enrolled: !!enrollment, enrollment });
    }

    // Get all enrollments for user
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in local database
    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      const email = user.emailAddresses[0].emailAddress;
      dbUser = await prisma.user.create({
        data: {
          id: userId,
          email: email,
          name:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            "Student",
          image: user.imageUrl,
          role: email === appConfig.adminEmail ? "ADMIN" : "STUDENT",
        },
      });
    } else if (
      user.emailAddresses[0].emailAddress === appConfig.adminEmail &&
      dbUser.role !== "ADMIN"
    ) {
      // Auto-promote existing user if email matches
      dbUser = await prisma.user.update({
        where: { id: userId },
        data: { role: "ADMIN" },
      });
    }

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (!course.published) {
      return NextResponse.json(
        { error: "Course is not published" },
        { status: 400 }
      );
    }

    // Check if course requires payment
    if (course.price > 0) {
      // Check if user has completed payment for this course
      const payment = await prisma.payment.findFirst({
        where: {
          userId: userId,
          courseId,
          status: "completed",
        },
      });

      if (!payment) {
        return NextResponse.json(
          {
            error: "Payment required",
            requiresPayment: true,
            courseId,
            price: course.price,
          },
          { status: 402 } // 402 Payment Required
        );
      }
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: userId,
        courseId,
        progress: 0,
        completed: false,
      },
    });

    console.log(
      `✅ Enrollment created: ${enrollment.id} for user ${userId} in course ${courseId}`
    );

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
