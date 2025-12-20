"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area"; // Assuming this exists or I'll use div with overflow
import {
  CheckCircle2,
  Circle,
  Play,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  FileText,
  Download,
  Award,
  BookOpen,
  FolderOpen,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  order: number;
  resources: { id: string; url: string }[] | string[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  lessons: Lesson[];
  instructor: {
    name: string;
    image: string | null;
  };
}

interface CoursePlayerProps {
  course: Course;
  currentLesson: Lesson;
  allLessons: Lesson[];
  initialCompletedLessons?: string[];
}

export function CoursePlayer({
  course,
  currentLesson,
  allLessons,
  initialCompletedLessons = [],
}: CoursePlayerProps) {
  const router = useRouter();
  const [completedLessons, setCompletedLessons] = useState<string[]>(
    initialCompletedLessons
  );
  const [isCompleting, setIsCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Removed useEffect for fetching completed lessons as it is now passed from server

  const handleLessonComplete = async () => {
    if (isCompleting || completedLessons.includes(currentLesson.id)) return;

    setIsCompleting(true);
    try {
      const response = await fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          courseId: course.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCompletedLessons([...completedLessons, currentLesson.id]);

        if (data.completed) {
          toast.success(
            "Course Completed! 🎉",
            "Congratulations on finishing the course!"
          );
          setTimeout(() => {
            router.push(`/courses/${course.slug}/certificate`);
          }, 2000);
        } else {
          toast.success("Lesson completed!", `Progress: ${data.progress}%`);
        }
      } else {
        const errorData = await response.json();
        toast.error("Error", errorData.error || "Failed to mark complete");
      }
    } catch (error) {
      console.error("Failed to mark lesson as complete:", error);
      toast.error("Error", "Something went wrong");
    } finally {
      setIsCompleting(false);
    }
  };

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const nextLesson = allLessons[currentIndex + 1];
  const prevLesson = allLessons[currentIndex - 1];
  const progress = Math.round(
    (completedLessons.length / allLessons.length) * 100
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href={`/courses/${course.slug}`}
            className="flex items-center text-gray-500 hover:text-primary transition-colors hover:bg-gray-50 p-2 rounded-md"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span className="hidden sm:inline font-medium text-sm">
              Back to Course
            </span>
          </Link>
          <div className="h-6 w-px bg-gray-200 hidden sm:block" />
          <h1 className="text-base font-semibold text-gray-800 truncate max-w-md hidden md:block">
            {course.title}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                Your Progress
              </span>
              <span className="font-bold text-gray-900">
                {progress}% Completed
              </span>
            </div>
            <div className="relative h-10 w-10 flex items-center justify-center">
              <svg
                className="h-full w-full -rotate-90 text-gray-200"
                viewBox="0 0 36 36"
              >
                <path
                  className="fill-none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  strokeWidth="3"
                  stroke="currentColor"
                />
                <path
                  className={cn(
                    "fill-none transition-all duration-1000 ease-out",
                    progress === 100 ? "text-green-500" : "text-primary"
                  )}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  strokeDasharray={`${progress}, 100`}
                  strokeWidth="3"
                  stroke="currentColor"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {progress === 100 ? (
                  <Award className="h-5 w-5 text-green-500" />
                ) : (
                  <span className="text-[10px] font-bold text-gray-700">
                    {progress}%
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-gray-600 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content (Left: Video + Tabs) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Video Player */}
            <div className="w-full bg-black aspect-video rounded-xl overflow-hidden shadow-2xl relative group">
              {currentLesson.videoUrl ? (
                <iframe
                  src={currentLesson.videoUrl}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-400">
                  <Play className="h-16 w-16 mb-4 opacity-40" />
                  <p className="font-medium text-lg">
                    Video Content Unavailable
                  </p>
                </div>
              )}
            </div>

            {/* Lesson Navigation & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                    Lesson {currentLesson.order}
                  </span>
                  <span className="text-gray-400 text-xs font-medium">
                    Video Lesson
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {currentLesson.title}
                </h1>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  onClick={handleLessonComplete}
                  disabled={
                    isCompleting || completedLessons.includes(currentLesson.id)
                  }
                  size="lg"
                  className={cn(
                    "flex-1 sm:flex-none transition-all shadow-sm font-semibold",
                    completedLessons.includes(currentLesson.id)
                      ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                      : "bg-primary text-white hover:bg-primary/90"
                  )}
                >
                  {isCompleting ? (
                    "Updating..."
                  ) : completedLessons.includes(currentLesson.id) ? (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" /> Completed
                    </>
                  ) : (
                    "Mark as Complete"
                  )}
                </Button>
              </div>
            </div>

            {/* Tabs (Overview & Resources) */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-gray-100/50 p-1 rounded-lg w-full sm:w-auto inline-flex h-auto gap-1 mb-6">
                <TabsTrigger
                  value="overview"
                  className="rounded-md px-6 py-2.5 text-sm font-medium text-gray-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex items-center gap-2 flex-1 sm:flex-none justify-center"
                >
                  <BookOpen className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="rounded-md px-6 py-2.5 text-sm font-medium text-gray-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex items-center gap-2 flex-1 sm:flex-none justify-center"
                >
                  <FolderOpen className="h-4 w-4" />
                  Resources
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="overview"
                className="animate-in fade-in-50 duration-300"
              >
                <div className="prose prose-gray max-w-none">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    About this lesson
                  </h3>
                  <div className="text-gray-600 leading-relaxed space-y-4">
                    {currentLesson.description ? (
                      <p>{currentLesson.description}</p>
                    ) : (
                      <p className="italic text-gray-400">
                        No additional description provided.
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="resources"
                className="animate-in fade-in-50 duration-300"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Lesson Materials
                  </h3>
                  {!currentLesson.resources ||
                  currentLesson.resources.length === 0 ? (
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-8 text-center">
                      <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">
                        No resources attached to this lesson.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {currentLesson.resources.map(
                        (resource: any, idx: number) => {
                          const url =
                            typeof resource === "string"
                              ? resource
                              : resource.url;
                          return (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener"
                              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
                            >
                              <div className="flex items-center gap-4 overflow-hidden">
                                <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 truncate">
                                    Resource File {idx + 1}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {url}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 group-hover:text-primary"
                              >
                                <Download className="h-5 w-5" />
                              </Button>
                            </a>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar (Right: Course Content) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Desktop Sticky Sidebar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hidden lg:block">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-lg text-gray-900">
                    Course Content
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {completedLessons.length} / {allLessons.length} lessons
                    completed
                  </p>

                  {/* Sidebar Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="max-h-[calc(100vh-250px)] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                  {allLessons.map((lesson, idx) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const isActive = lesson.id === currentLesson.id;
                    return (
                      <div
                        key={lesson.id}
                        onClick={() =>
                          router.push(
                            `/courses/learn/${course.id}?lesson=${lesson.id}`
                          )
                        }
                        className={cn(
                          "group flex items-start gap-3 p-3 rounded-lg cursor-pointer mb-1 transition-all",
                          isActive
                            ? "bg-primary text-white shadow-md ring-1 ring-primary"
                            : "hover:bg-gray-50 text-gray-700"
                        )}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCompleted && !isActive ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : isActive ? (
                            <Play className="h-5 w-5 fill-current" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "text-sm font-medium leading-snug",
                              isActive
                                ? "text-white"
                                : "text-gray-900 group-hover:text-primary"
                            )}
                          >
                            {lesson.title}
                          </p>
                          <span
                            className={cn(
                              "text-xs opacity-80 block mt-1",
                              isActive ? "text-white/80" : "text-gray-500"
                            )}
                          >
                            Lesson {idx + 1}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instructor Card (Optional improvement) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hidden lg:block">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                  Instructor
                </h4>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden border border-gray-200 relative">
                    {course.instructor.image ? (
                      <img
                        src={course.instructor.image}
                        alt={course.instructor.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary text-white font-bold text-xl">
                        {course.instructor.name?.[0] || "I"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {course.instructor.name}
                    </p>
                    <p className="text-xs text-gray-500">Course Creator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden ease-in-out duration-300">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">
                Course Content
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {allLessons.map((lesson, idx) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isActive = lesson.id === currentLesson.id;
                return (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      router.push(
                        `/courses/learn/${course.id}?lesson=${lesson.id}`
                      );
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-2 transition-all border",
                      isActive
                        ? "bg-primary/5 border-primary text-primary"
                        : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200 text-gray-700"
                    )}
                  >
                    <div className="shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : isActive ? (
                        <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {lesson.title}
                      </p>
                      <span className="text-xs text-gray-500">
                        Lesson {idx + 1}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
