"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "@/lib/toast"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, X } from "lucide-react"

interface Lesson {
  title: string
  description: string
  videoUrl: string
  resources: string[]
}

export function CreateCourseForm() {
  const router = useRouter()
  const [lessons, setLessons] = useState<Lesson[]>([
    { title: "", description: "", videoUrl: "", resources: [] },
  ])
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const addLesson = () => {
    setLessons([...lessons, { title: "", description: "", videoUrl: "", resources: [] }])
  }

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index))
  }

  const updateLesson = (index: number, field: keyof Lesson, value: any) => {
    const updated = [...lessons]
    updated[index] = { ...updated[index], [field]: value }
    setLessons(updated)
  }

  const addResource = (lessonIndex: number, resource: string) => {
    if (!resource.trim()) return
    const updated = [...lessons]
    updated[lessonIndex].resources = [...updated[lessonIndex].resources, resource]
    setLessons(updated)
  }

  const removeResource = (lessonIndex: number, resourceIndex: number) => {
    const updated = [...lessons]
    updated[lessonIndex].resources = updated[lessonIndex].resources.filter(
      (_, i) => i !== resourceIndex
    )
    setLessons(updated)
  }

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          lessons: lessons.map((lesson, index) => ({
            ...lesson,
            order: index + 1,
          })),
        }),
      })

      if (response.ok) {
        const course = await response.json()
        toast.success("Course created!", "You can now add lessons and publish it.")
        router.push(`/dashboard/instructor/edit/${course.id}`)
      } else {
        const data = await response.json()
        toast.error("Failed to create course", data.error || "Please try again.")
      }
    } catch (error) {
      toast.error("Something went wrong", "Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              {...register("title", { required: true })}
              placeholder="e.g., Complete Web Development Bootcamp"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">Title is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description", { required: true })}
              placeholder="Describe what students will learn..."
              rows={6}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">Description is required</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                {...register("category", { required: true })}
                onValueChange={(value) => {
                  const event = { target: { name: "category", value } }
                  register("category").onChange(event)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Photography">Photography</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                {...register("difficulty")}
                onValueChange={(value) => {
                  const event = { target: { name: "difficulty", value } }
                  register("difficulty").onChange(event)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register("price", { required: true, valueAsNumber: true, min: 0 })}
                placeholder="0.00"
                defaultValue={0}
              />
              <p className="text-xs text-gray-500 mt-1">Set to 0 for free courses</p>
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                {...register("language")}
                placeholder="e.g., English"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="thumbnailUrl">Thumbnail URL *</Label>
              <Input
                id="thumbnailUrl"
                {...register("thumbnailUrl", { required: true })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="introVideoUrl">Intro Video URL</Label>
              <Input
                id="introVideoUrl"
                {...register("introVideoUrl")}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="language">Language</Label>
            <Input
              id="language"
              {...register("language")}
              placeholder="e.g., English"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Course Curriculum</CardTitle>
            <Button type="button" onClick={addLesson} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Lesson
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {lessons.map((lesson, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Lesson {index + 1}</h3>
                {lessons.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLesson(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div>
                <Label>Lesson Title *</Label>
                <Input
                  value={lesson.title}
                  onChange={(e) =>
                    updateLesson(index, "title", e.target.value)
                  }
                  placeholder="Lesson title"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={lesson.description}
                  onChange={(e) =>
                    updateLesson(index, "description", e.target.value)
                  }
                  placeholder="Lesson description"
                  rows={3}
                />
              </div>

              <div>
                <Label>Video URL *</Label>
                <Input
                  value={lesson.videoUrl}
                  onChange={(e) =>
                    updateLesson(index, "videoUrl", e.target.value)
                  }
                  placeholder="https://youtube.com/watch?v=... or video URL"
                />
              </div>

              <div>
                <Label>Resources (PDFs, Links)</Label>
                <div className="space-y-2">
                  {lesson.resources.map((resource, resIndex) => (
                    <div key={resIndex} className="flex items-center space-x-2">
                      <Input value={resource} readOnly />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeResource(index, resIndex)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add resource URL"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addResource(index, e.currentTarget.value)
                          e.currentTarget.value = ""
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        if (input.value) {
                          addResource(index, input.value)
                          input.value = ""
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/instructor")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating...
            </>
          ) : (
            "Create Course"
          )}
        </Button>
      </div>
    </form>
  )
}

