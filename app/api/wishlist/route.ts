import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
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
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      await prisma.user.create({
        data: {
          id: userId,
          email: user.emailAddresses[0].emailAddress,
          name:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            "Student",
          image: user.imageUrl,
          role: "STUDENT",
        },
      });
    }

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findFirst({
      where: {
        userId,
        courseId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Course already in wishlist" },
        { status: 400 }
      );
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        courseId,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(wishlistItem, { status: 201 });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    await prisma.wishlist.deleteMany({
      where: {
        userId,
        courseId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
