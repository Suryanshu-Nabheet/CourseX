import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createPaymentIntent } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if already purchased
    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId: userId,
        courseId,
        status: "completed",
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: "Course already purchased" },
        { status: 400 }
      );
    }

    // Check if course is free
    if (course.price === 0) {
      return NextResponse.json(
        { error: "This course is free. Please use the enroll endpoint." },
        { status: 400 }
      );
    }

    // Create payment record
    // Create payment intent
    const result = await createPaymentIntent(
      course.price,
      courseId,
      userId,
      course.title
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: userId,
        courseId,
        amount: course.price,
        status: "pending",
        currency: "USD",
        paymentIntentId: result.paymentIntentId!, // We know it exists if no error
      },
    });

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
