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
}

export function CoursePlayer({
  course,
  currentLesson,
  allLessons,
}: CoursePlayerProps) {
  const router = useRouter();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchCompletedLessons = async () => {
      try {
        const response = await fetch(`/api/enrollments?courseId=${course.id}`);
        if (response.ok) {
          const data = await response.json();
          // In a real app, parse data to find completed lesson IDs
          // For now, tracking locally or assuming API returns list in future
        }
      } catch (error) {
        console.error("Failed to fetch completed lessons:", error);
      }
    };
    fetchCompletedLessons();
  }, [course.id]);

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
    <div className="flex h-screen flex-col bg-gray-900 text-white overflow-hidden font-sans">
      {/* Top Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-800 bg-gray-900 px-4 shadow-md z-10">
        <div className="flex items-center gap-4">
          <Link
            href={`/courses/${course.slug}`}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span className="hidden sm:inline font-medium">Back to Course</span>
          </Link>
          <div className="h-6 w-px bg-gray-700 mx-2 hidden sm:block" />
          <h1 className="text-lg font-semibold truncate max-w-md hidden md:block">
            {course.title}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress Circle or Bar */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="hidden sm:block">
              <span className="text-white font-medium">{progress}%</span>{" "}
              Complete
            </div>
            <Award
              className={cn(
                "h-5 w-5",
                progress === 100 ? "text-yellow-500" : "text-gray-600"
              )}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-gray-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-gray-50 overflow-y-auto relative scroll-smooth">
          {/* Video Player Container */}
          <div className="w-full bg-black aspect-video max-h-[75vh] flex items-center justify-center shadow-lg relative shrink-0">
            {currentLesson.videoUrl ? (
              <iframe
                src={currentLesson.videoUrl}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500">
                <Play className="h-20 w-20 mb-4 opacity-50" />
                <p className="text-lg">Video Content Unavailable</p>
              </div>
            )}
          </div>

          {/* Lesson Details & Tabs */}
          <div className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8 border-b border-gray-200 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentLesson.title}
                </h2>
                <div className="flex items-center text-gray-500 text-sm">
                  <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-semibold mr-3">
                    Lesson {currentLesson.order}
                  </span>
                  <span>By {course.instructor.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  onClick={handleLessonComplete}
                  disabled={
                    isCompleting || completedLessons.includes(currentLesson.id)
                  }
                  className={cn(
                    "min-w-[160px] transition-all",
                    completedLessons.includes(currentLesson.id)
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : ""
                  )}
                >
                  {isCompleting ? (
                    "Updating..."
                  ) : completedLessons.includes(currentLesson.id) ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Completed
                    </>
                  ) : (
                    "Mark as Complete"
                  )}
                </Button>

                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={!prevLesson}
                    onClick={() =>
                      prevLesson &&
                      router.push(
                        `/courses/learn/${course.id}?lesson=${prevLesson.id}`
                      )
                    }
                    className="text-gray-700 border-gray-300 hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={!nextLesson}
                    onClick={() =>
                      nextLesson &&
                      router.push(
                        `/courses/learn/${course.id}?lesson=${nextLesson.id}`
                      )
                    }
                    className="text-gray-700 border-gray-300 hover:bg-gray-100"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:w-[400px] mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              <TabsContent
                value="overview"
                className="space-y-6 animate-in fade-in-50 duration-300"
              >
                <div className="prose max-w-none text-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    About this lesson
                  </h3>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {currentLesson.description ||
                      "No description provided for this lesson."}
                  </p>
                </div>
              </TabsContent>

              <TabsContent
                value="resources"
                className="animate-in fade-in-50 duration-300"
              >
                <div className="bg-white rounded-lg border border-gray-200 p-6 min-h-[200px]">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Download className="mr-2 h-5 w-5 text-gray-500" />
                    Downloadable Resources
                  </h3>

                  {!currentLesson.resources ||
                  currentLesson.resources.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 italic">
                      No resources attached to this lesson.
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {currentLesson.resources.map(
                        (resource: any, idx: number) => {
                          const url =
                            typeof resource === "string"
                              ? resource
                              : resource.url;
                          return (
                            <li key={idx}>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener"
                                className="flex items-center p-3 rounded-md border border-gray-100 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all group"
                              >
                                <div className="bg-white p-2 rounded shadow-sm group-hover:shadow mr-3">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    Resource {idx + 1}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {url}
                                  </p>
                                </div>
                                <Download className="h-4 w-4 text-gray-400 group-hover:text-primary ml-2" />
                              </a>
                            </li>
                          );
                        }
                      )}
                    </ul>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Right Sidebar - Lesson List */}
        <aside
          className={cn(
            "w-full md:w-80 lg:w-96 bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out absolute md:relative h-full z-20 shadow-xl md:shadow-none",
            sidebarOpen
              ? "translate-x-0"
              : "translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-900">Course Content</h3>
            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {allLessons.map((lesson, idx) => {
              const isCompleted = completedLessons.includes(lesson.id);
              const isActive = lesson.id === currentLesson.id;

              return (
                <div
                  key={lesson.id}
                  id={`lesson-${lesson.id}`}
                  onClick={() => {
                    router.push(
                      `/courses/learn/${course.id}?lesson=${lesson.id}`
                    );
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={cn(
                    "group flex items-start p-3 rounded-lg cursor-pointer transition-all border",
                    isActive
                      ? "bg-primary/5 border-primary/20 shadow-sm"
                      : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"
                  )}
                >
                  <div className="mr-3 mt-0.5">
                    {isActive ? (
                      isCompleted ? (
                        <div className="text-green-600 bg-green-100 rounded-full p-0.5">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="text-primary bg-primary/10 rounded-full p-0.5 animate-pulse">
                          <Play className="h-4 w-4 fill-current" />
                        </div>
                      )
                    ) : isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-gray-300 rounded-full flex items-center justify-center text-[10px] font-medium text-gray-400">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium leading-tight mb-1",
                        isActive ? "text-primary" : "text-gray-700"
                      )}
                    >
                      {lesson.title}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 gap-2">
                      <span>Lesson {idx + 1}</span>
                      {/* Add duration here if available in future */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
