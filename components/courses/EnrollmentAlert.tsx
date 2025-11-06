"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export function EnrollmentAlert() {
  const searchParams = useSearchParams()
  const enroll = searchParams.get("enroll")

  if (enroll !== "true") {
    return null
  }

  return (
    <Card className="mb-6 border-yellow-200 bg-yellow-50">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">
              Enrollment Required
            </h3>
            <p className="text-sm text-yellow-800">
              You need to enroll in this course to access the lessons. Please click the "Enroll Now" button below.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

