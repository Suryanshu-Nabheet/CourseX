"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { toast } from "@/lib/toast";
import { CheckCircle2, Lock, ArrowLeft, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const courseId = params.courseId as string;
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in?redirect_url=/checkout/" + courseId);
    }
  }, [isLoaded, isSignedIn, router, courseId]);

  useEffect(() => {
    async function loadCourse() {
      try {
        // Fetch course details
        const courseRes = await fetch(`/api/courses/${courseId}`);
        if (!courseRes.ok) {
          router.push("/courses");
          return;
        }
        const courseData = await courseRes.json();
        setCourse(courseData);

        // Create payment intent
        const paymentRes = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        });

        if (!paymentRes.ok) {
          const error = await paymentRes.json();
          toast.error(
            "Payment Error",
            error.error || "Failed to initialize payment"
          );
          router.push(`/courses/${courseData.slug}`);
          return;
        }

        const paymentData = await paymentRes.json();
        setPaymentIntent(paymentData);
      } catch (error) {
        console.error("Error loading checkout:", error);
        toast.error("Error", "Failed to load checkout page");
        router.push("/courses");
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      loadCourse();
    }
  }, [courseId, router]);

  const handlePayment = async () => {
    if (!paymentIntent) return;

    setProcessing(true);
    try {
      // For mock payments (development), auto-confirm
      if (!paymentIntent.clientSecret) {
        // Mock payment - auto confirm
        const confirmRes = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.paymentIntentId,
            paymentId: paymentIntent.paymentId,
          }),
        });

        if (confirmRes.ok) {
          toast.success(
            "Payment Successful!",
            "You now have access to the course."
          );
          router.push(`/courses/learn/${courseId}`);
        } else {
          const error = await confirmRes.json();
          toast.error("Payment Failed", error.error || "Please try again");
        }
        return;
      }

      // For real Stripe integration, you would use Stripe Elements here
      // For now, we'll use mock payment
      const confirmRes = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.paymentIntentId,
          paymentId: paymentIntent.paymentId,
        }),
      });

      if (confirmRes.ok) {
        toast.success(
          "Payment Successful!",
          "You now have access to the course."
        );
        router.push(`/courses/learn/${courseId}`);
      } else {
        const error = await confirmRes.json();
        toast.error("Payment Failed", error.error || "Please try again");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment Error", "Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!course || !paymentIntent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Course not found</p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const platformFee = course.price * 0.1;
  const total = course.price;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {course.thumbnailUrl && (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      width={120}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {course.description}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      By {course.instructor?.name || "Instructor"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>
                  {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                    ? "Secure payment powered by Stripe"
                    : "Development mode - Mock payment"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Development Mode:</strong> Payments are simulated.
                      No real charges will be made.
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Course Price</span>
                    <span className="font-medium">
                      ${course.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform Fee (10%)</span>
                    <span className="text-gray-600">
                      ${platformFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Complete Purchase</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Course</span>
                    <span className="font-medium">
                      ${course.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Complete Purchase
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By completing this purchase, you agree to our Terms of Service
                  and Privacy Policy.
                </p>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    Lifetime access
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    Certificate of completion
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                    30-day money-back guarantee
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
