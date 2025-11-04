import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createPaymentIntent } from "@/lib/payments"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

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

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    // Check if already purchased
    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId: session.user.id,
        courseId,
        status: "completed",
      },
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: "Course already purchased" },
        { status: 400 }
      )
    }

    // Check if course is free
    if (course.price === 0) {
      return NextResponse.json(
        { error: "This course is free. Please use the enroll endpoint." },
        { status: 400 }
      )
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        courseId,
        amount: course.price,
        status: "pending",
        currency: "USD",
      },
    })

    // Create payment intent
    const result = await createPaymentIntent(
      course.price,
      courseId,
      session.user.id,
      course.title
    )

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Update payment with payment intent ID
    if (result.paymentIntentId) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { paymentIntentId: result.paymentIntentId },
      })
    }

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
      paymentId: payment.id,
    })
  } catch (error) {
    console.error("Payment intent error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
