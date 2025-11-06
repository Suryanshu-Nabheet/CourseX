"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Lock, ShoppingCart } from "lucide-react"
import { toast } from "@/lib/toast"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

interface EnrollButtonProps {
  courseId: string
  courseSlug?: string
  isEnrolled: boolean
  userId?: string
  price: number
  courseTitle?: string
}

export function EnrollButton({ 
  courseId, 
  courseSlug,
  isEnrolled, 
  userId,
  price,
  courseTitle
}: EnrollButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleEnroll = async () => {
    if (!userId) {
      router.push("/auth/login")
      toast.info("Please sign in to enroll in courses")
      return
    }

    // If course is paid, redirect to checkout
    if (price > 0) {
      router.push(`/checkout/${courseId}`)
      return
    }

    // Free course enrollment
    setLoading(true)
    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })

      if (response.ok) {
        const enrollmentData = await response.json()
        console.log("Enrollment successful:", enrollmentData)
        toast.success("Successfully enrolled!", "You now have access to all course materials.")
        // Wait a bit longer and use window.location for a hard refresh
        setTimeout(() => {
          window.location.href = `/courses/learn/${courseId}`
        }, 1000)
      } else if (response.status === 402) {
        // Payment required
        const data = await response.json()
        router.push(`/checkout/${courseId}`)
      } else {
        const data = await response.json()
        toast.error("Enrollment failed", data.error || "Please try again later.")
      }
    } catch (error) {
      toast.error("Something went wrong", "Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  if (isEnrolled) {
    return (
      <Button disabled className="w-full">
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Enrolled
      </Button>
    )
  }

  const isPaid = price > 0

  return (
    <Button
      onClick={handleEnroll}
      disabled={loading || !userId}
      className="w-full"
      size="lg"
      variant={isPaid ? "default" : "default"}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          {isPaid ? "Processing..." : "Enrolling..."}
        </>
      ) : isPaid ? (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Buy Now - ${price.toFixed(2)}
        </>
      ) : (
        "Enroll Now (Free)"
      )}
    </Button>
  )
}
