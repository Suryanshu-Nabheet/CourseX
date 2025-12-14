import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

async function getPurchases(userId: string) {
  try {
    const purchases = await prisma.payment.findMany({
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

    return purchases;
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return [];
  }
}

export default async function PurchasesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const purchases = await getPurchases(userId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Purchases
          </h1>
          <p className="text-gray-600">
            View all your course purchases and orders
          </p>
        </div>

        {purchases.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600 mb-4">
                You haven't purchased any courses yet.
              </p>
              <Button asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <Card
                key={purchase.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {purchase.course.thumbnailUrl && (
                      <Image
                        src={purchase.course.thumbnailUrl}
                        alt={purchase.course.title}
                        width={200}
                        height={120}
                        className="rounded-lg object-cover w-full sm:w-48"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {purchase.course.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            by {purchase.course.instructor.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(purchase.status)}
                          <span className="text-sm font-medium text-gray-700">
                            {getStatusText(purchase.status)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                        <span>
                          Amount:{" "}
                          <strong className="text-gray-900">
                            ${purchase.amount.toFixed(2)}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Purchased:{" "}
                          {new Date(purchase.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {purchase.status === "completed" ? (
                        <div className="flex gap-3">
                          <Button asChild>
                            <Link href={`/courses/learn/${purchase.course.id}`}>
                              Continue Learning
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" asChild>
                            <Link href={`/courses/${purchase.course.slug}`}>
                              View Course
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" disabled>
                          {purchase.status === "pending"
                            ? "Payment Processing..."
                            : "Payment Failed"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
