"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Play, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "@/lib/toast"

interface Lesson {
  id: string
  title: string
  description: string | null
  videoUrl: string
  order: number
  resources: string[]
}

interface Course {
  id: string
  title: string
  slug: string
  lessons: Lesson[]
  instructor: {
    name: string
    image: string | null
  }
}

interface CoursePlayerProps {
  course: Course
  currentLesson: Lesson
  allLessons: Lesson[]
}

export function CoursePlayer({
  course,
  currentLesson,
  allLessons,
}: CoursePlayerProps) {
  const router = useRouter()
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [isCompleting, setIsCompleting] = useState(false)

  useEffect(() => {
    // Fetch completed lessons from the server
    const fetchCompletedLessons = async () => {
      try {
        const response = await fetch(`/api/enrollments?courseId=${course.id}`)
        if (response.ok) {
          const data = await response.json()
          // In production, you'd have a list of completed lesson IDs
          // For now, we'll track locally based on API responses
        }
      } catch (error) {
        console.error("Failed to fetch completed lessons:", error)
      }
    }

    fetchCompletedLessons()
  }, [course.id])

  const handleLessonComplete = async () => {
    // Prevent double-submission
    if (isCompleting || completedLessons.includes(currentLesson.id)) {
      return
    }

    setIsCompleting(true)
    try {
      const response = await fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          courseId: course.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCompletedLessons([...completedLessons, currentLesson.id])
        
        if (data.completed) {
          toast.success("Course Completed! 🎉", "Congratulations on finishing the course!")
          // Optionally redirect to certificate page
          setTimeout(() => {
            router.push(`/courses/${course.slug}/certificate`)
          }, 2000)
        } else {
          toast.success("Lesson completed!", `Progress: ${data.progress}%`)
        }
      } else {
        const errorData = await response.json()
        toast.error("Failed to mark lesson as complete", errorData.error || "Please try again.")
      }
    } catch (error) {
      console.error("Failed to mark lesson as complete:", error)
      toast.error("Something went wrong", "Please try again later.")
    } finally {
      setIsCompleting(false)
    }
  }

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id)
  const nextLesson = allLessons[currentIndex + 1]
  const prevLesson = allLessons[currentIndex - 1]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
        <div className="p-4 border-b">
          <Link href={`/courses/${course.slug}`}>
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
          <h2 className="font-semibold mt-4 line-clamp-2">{course.title}</h2>
        </div>
        <div className="p-2">
          <div className="space-y-1">
            {allLessons.map((lesson) => {
              const isCompleted = completedLessons.includes(lesson.id)
              const isActive = lesson.id === currentLesson.id

              return (
                <button
                  key={lesson.id}
                  onClick={() =>
                    router.push(`/courses/learn/${course.id}?lesson=${lesson.id}`)
                  }
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{lesson.title}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Video Player */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          <div className="w-full h-full">
            {currentLesson.videoUrl ? (
              <iframe
                src={currentLesson.videoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <div className="text-center">
                  <Play className="h-16 w-16 mx-auto mb-4" />
                  <p>Video URL not available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lesson Info */}
        <Card className="m-4 sm:m-6 lg:m-8 shadow-lg">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
              <Button 
                onClick={handleLessonComplete} 
                variant="outline"
                disabled={isCompleting || completedLessons.includes(currentLesson.id)}
              >
                {isCompleting 
                  ? "Completing..." 
                  : completedLessons.includes(currentLesson.id)
                  ? "Completed ✓"
                  : "Mark as Complete"}
              </Button>
            </div>
            {currentLesson.description && (
              <p className="text-gray-700 mb-4">{currentLesson.description}</p>
            )}

            {currentLesson.resources.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Resources</h3>
                <ul className="space-y-1">
                  {currentLesson.resources.map((resource, idx) => (
                    <li key={idx}>
                      <a
                        href={resource}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {resource}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6 pt-6 border-t">
              {prevLesson ? (
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/courses/learn/${course.id}?lesson=${prevLesson.id}`)
                  }
                >
                  Previous Lesson
                </Button>
              ) : (
                <div />
              )}
              {nextLesson && (
                <Button
                  onClick={() =>
                    router.push(`/courses/learn/${course.id}?lesson=${nextLesson.id}`)
                  }
                >
                  Next Lesson
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

