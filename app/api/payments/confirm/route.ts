import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { confirmPayment } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentIntentId, paymentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 }
      );
    }

    // Confirm payment with Stripe (or mock)
    const result = await confirmPayment(paymentIntentId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Payment confirmation failed" },
        { status: 400 }
      );
    }

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Update payment status
    const payment = (await prisma.payment.findUnique({
      where: { id: paymentId },
    })) as any;

    if (!payment || !payment.courseId) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Get course to verify
    const course = await prisma.course.findUnique({
      where: { id: payment.courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Update payment to completed
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "completed" },
    });

    // Create enrollment if it doesn't exist
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId: payment.courseId,
        },
      },
    });

    if (!existingEnrollment) {
      await prisma.enrollment.create({
        data: {
          studentId: userId,
          courseId: payment.courseId,
          progress: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      courseId: payment.courseId,
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
