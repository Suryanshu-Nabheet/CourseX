"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "@/lib/toast";

interface WishlistButtonProps {
  courseId: string;
  className?: string;
}

export function WishlistButton({ courseId, className }: WishlistButtonProps) {
  const { user, isSignedIn } = useUser();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkWishlist() {
      if (!user) return;

      try {
        const response = await fetch("/api/wishlist");
        if (response.ok) {
          const items = await response.json();
          setIsWishlisted(
            items.some((item: any) => item.courseId === courseId)
          );
        }
      } catch (error) {
        console.error("Error checking wishlist:", error);
      }
    }

    checkWishlist();
  }, [user, courseId]);

  const handleToggle = async () => {
    if (!isSignedIn) {
      toast.info("Please sign in", "Sign in to add courses to your wishlist");
      return;
    }

    setLoading(true);
    try {
      if (isWishlisted) {
        const response = await fetch(`/api/wishlist?courseId=${courseId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setIsWishlisted(false);
          toast.success("Removed from wishlist");
        } else {
          toast.error("Failed to remove from wishlist");
        }
      } else {
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        });

        if (response.ok) {
          setIsWishlisted(true);
          toast.success("Added to wishlist");
        } else {
          toast.error("Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={className}
    >
      <Heart
        className={`h-4 w-4 mr-2 ${
          isWishlisted ? "fill-red-500 text-red-500" : ""
        }`}
      />
      {isWishlisted ? "Wishlisted" : "Wishlist"}
    </Button>
  );
}
