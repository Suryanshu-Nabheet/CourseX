import { NextResponse } from "next/server";
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
            name: true,
            image: true,
          },
        },
        reviews: true,
        enrollments: true,
        lessons: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const rating =
      course.reviews.length > 0
        ? course.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
          course.reviews.length
        : 0;

    return NextResponse.json({
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      description: course.description,
      provider: {
        "@type": "Organization",
        name: "CourseX",
      },
      instructor: {
        "@type": "Person",
        name: course.instructor.name,
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating.toFixed(1),
        reviewCount: course.reviews.length,
      },
      numberOfCredits: course.lessons.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
