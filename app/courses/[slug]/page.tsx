import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Star,
  Clock,
  Users,
  Play,
  CheckCircle2,
  Heart,
  Share2,
  Award,
  CalendarDays,
  GraduationCap,
  Globe,
  PlayCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { EnrollButton } from "@/components/courses/EnrollButton";
import { ReviewSection } from "@/components/courses/ReviewSection";
import { CourseVideoPlayer } from "@/components/courses/CourseVideoPlayer";
import { ExpandableSection } from "@/components/courses/ExpandableSection";
import { WishlistButton } from "@/components/courses/WishlistButton";
import { EnrollmentAlert } from "@/components/courses/EnrollmentAlert";

async function getCourse(slug: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { slug, published: true },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        lessons: {
          orderBy: { order: "asc" },
        },
        enrollments: true,
        reviews: {
          include: {
            course: false,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    return course;
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);
  const { userId } = await auth();

  if (!course) {
    notFound();
  }

  let isEnrolled: any = null;
  if (userId && course) {
    try {
      isEnrolled = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: userId,
            courseId: course.id,
          },
        },
      });
    } catch (error) {
      console.error("Error checking enrollment:", error);
    }
  }

  const rating =
    course.reviews.length > 0
      ? course.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
        course.reviews.length
      : 0;

  const totalEnrollments = course.enrollments.length;

  // Placeholder learning outcomes - in production, this would come from the database
  const learningOutcomes = [
    `Master the fundamentals of ${course.category}`,
    "Build real-world projects and applications",
    "Understand industry best practices and standards",
    "Gain practical skills applicable to your career",
    "Learn from hands-on examples and exercises",
  ];

  // Placeholder skills - in production, this would come from the database
  const skillsGained = [
    course.category,
    course.difficulty || "Skill Building",
    "Problem Solving",
    "Best Practices",
    "Practical Application",
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner Section */}
      <div className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-300">
                  {course.instructor.name}
                </span>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-sm text-gray-300">
                  Taught by {course.instructor.name}
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                {course.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-600 text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">
                  {rating.toFixed(1)}
                </span>
                <span className="text-gray-300">
                  ({course.reviews.length}{" "}
                  {course.reviews.length === 1 ? "rating" : "ratings"})
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">
                  {totalEnrollments}{" "}
                  {totalEnrollments === 1 ? "student" : "students"} enrolled
                </span>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                {course.price > 0 ? (
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full font-medium">
                    ${course.price.toFixed(2)}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-600 text-white rounded-full font-medium">
                    Free
                  </span>
                )}
                <span className="text-gray-300">
                  {course.lessons.length}{" "}
                  {course.lessons.length === 1 ? "lesson" : "lessons"}
                </span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <WishlistButton
                courseId={course.id}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <EnrollmentAlert />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About this Course */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About this Course
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </section>

            {/* What you'll learn */}
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                What you&apos;ll learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{outcome}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Skills you'll gain */}
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Skills you&apos;ll gain
              </h2>
              <div className="flex flex-wrap gap-3">
                {skillsGained.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Course Content */}
            <section className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {course.lessons.length}{" "}
                {course.lessons.length === 1 ? "Lesson" : "Lessons"} in this
                Course
              </h2>
              <div className="space-y-2">
                {course.lessons.map((lesson: any, index: number) => (
                  <ExpandableSection
                    key={lesson.id}
                    title={`${index + 1}. ${lesson.title}`}
                    defaultExpanded={index === 0}
                  >
                    {lesson.description && (
                      <p className="text-gray-600 mb-4">{lesson.description}</p>
                    )}
                    {isEnrolled ? (
                      <a
                        href={`/courses/learn/${course.id}?lesson=${lesson.id}`}
                        className="inline-flex items-center text-primary hover:underline font-medium"
                      >
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Watch Lesson
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Enroll to access this lesson
                      </p>
                    )}
                  </ExpandableSection>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <ReviewSection
              courseId={course.id}
              reviews={course.reviews}
              isEnrolled={!!isEnrolled}
            />
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Video Player Card */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-0">
                  <CourseVideoPlayer
                    videoUrl={course.introVideoUrl}
                    thumbnailUrl={
                      course.thumbnailUrl || "/placeholder-course.jpg"
                    }
                    title={course.title}
                  />
                </CardContent>
              </Card>

              {/* Enrollment Card */}
              <Card className="shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    {course.price > 0 ? (
                      <>
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          ${course.price.toFixed(2)}
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                          One-time payment
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          Free
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                          No credit card required
                        </p>
                      </>
                    )}

                    <EnrollButton
                      courseId={course.id}
                      courseSlug={course.slug}
                      isEnrolled={!!isEnrolled}
                      userId={userId ?? undefined}
                      price={course.price}
                      courseTitle={course.title}
                    />

                    {isEnrolled && (
                      <Button variant="outline" className="w-full mt-3" asChild>
                        <a href={`/courses/learn/${course.id}`}>
                          Continue Learning
                        </a>
                      </Button>
                    )}

                    <Button variant="outline" className="w-full mt-3" size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* This course includes */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">
                    This course includes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 text-sm">
                    <Award className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-gray-700">Shareable Certificate</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <CalendarDays className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-gray-700">Flexible Schedule</span>
                  </div>
                  {course.difficulty && (
                    <div className="flex items-center space-x-3 text-sm">
                      <GraduationCap className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-gray-700">
                        {course.difficulty} Level
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 text-sm">
                    <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-gray-700">
                      Approx. {course.lessons.length}{" "}
                      {course.lessons.length === 1 ? "lesson" : "lessons"} to
                      complete
                    </span>
                  </div>
                  {course.language && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Globe className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-gray-700">{course.language}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Instructor Card */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    {course.instructor.image && (
                      <Image
                        src={course.instructor.image}
                        alt={course.instructor.name}
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {course.instructor.name}
                      </h3>
                      <p className="text-sm text-gray-600">Course Instructor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
