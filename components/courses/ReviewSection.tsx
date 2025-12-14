"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  userName: string | null;
  userImage: string | null;
  createdAt: Date;
}

interface ReviewSectionProps {
  courseId: string;
  reviews: Review[];
  isEnrolled: boolean;
}

export function ReviewSection({
  courseId,
  reviews,
  isEnrolled,
}: ReviewSectionProps) {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      router.push("/sign-in");
      toast.info("Please sign in to leave a review");
      return;
    }

    if (!isEnrolled) {
      toast.error(
        "Enrollment required",
        "You must be enrolled in this course to leave a review."
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, rating: parseInt(rating), comment }),
      });

      if (response.ok) {
        toast.success("Review submitted!", "Thank you for your feedback.");
        router.refresh();
        setRating("");
        setComment("");
      } else {
        const data = await response.json();
        toast.error(
          "Failed to submit review",
          data.error || "Please try again."
        );
      }
    } catch (error) {
      toast.error("Something went wrong", "Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  // Calculate rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === star).length / reviews.length) *
          100
        : 0,
  }));

  return (
    <section className="border-t border-gray-200 pt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>

      {reviews.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex items-center space-x-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-300 text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 mt-1">
                {averageRating.toFixed(1)} out of 5 stars
              </span>
            </div>

            <div className="flex-1 space-y-2">
              {ratingBreakdown.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 w-12">
                    {star} star
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {isSignedIn && isEnrolled && (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 p-6 border border-gray-200 rounded-lg bg-gray-50"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Write a Review
            </h3>
            <Select value={rating} onValueChange={setRating} required>
              <SelectTrigger>
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </form>
        )}

        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No reviews yet. Be the first to review!
            </p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-200 pb-6 last:border-0"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {(review.userName || "A")[0].toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {review.userName || "Anonymous"}
                        </span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-700 leading-relaxed ml-[52px]">
                    {review.comment}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
