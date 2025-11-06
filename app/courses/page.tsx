import { prisma } from "@/lib/prisma"
import { CourseCard } from "@/components/courses/CourseCard"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CourseFilters } from "@/components/courses/CourseFilters"
import { Pagination } from "@/components/shared/Pagination"

const COURSES_PER_PAGE = 12

async function getCourses(searchParams: {
  search?: string
  category?: string
  difficulty?: string
  sort?: string
  page?: string
}) {
  try {
    const where: any = {
      published: true,
    }

    if (searchParams.search) {
      where.OR = [
        { title: { contains: searchParams.search, mode: "insensitive" } },
        { description: { contains: searchParams.search, mode: "insensitive" } },
        { instructor: { name: { contains: searchParams.search, mode: "insensitive" } } },
      ]
    }

    if (searchParams.category) {
      where.category = searchParams.category
    }

    if (searchParams.difficulty) {
      where.difficulty = searchParams.difficulty
    }

    let orderBy: any = { createdAt: "desc" }
    
    switch (searchParams.sort) {
      case "rating":
        // Sort by average rating (calculated in the map)
        orderBy = { createdAt: "desc" } // Will sort client-side after calculating rating
        break
      case "enrollments":
        // Sort by enrollment count
        orderBy = { enrollments: { _count: "desc" } }
        break
      case "newest":
        orderBy = { createdAt: "desc" }
        break
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      default:
        orderBy = { createdAt: "desc" }
    }

    const page = parseInt(searchParams.page || "1")
    const skip = (page - 1) * COURSES_PER_PAGE

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: {
            select: {
              name: true,
              image: true,
            },
          },
          enrollments: true,
          reviews: true,
        },
        orderBy,
        skip,
        take: COURSES_PER_PAGE,
      }),
      prisma.course.count({ where }),
    ])

    let mappedCourses = courses.map((course) => ({
      ...course,
      rating:
        course.reviews.length > 0
          ? course.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
            course.reviews.length
          : 0,
      totalReviews: course.reviews.length,
      enrollmentCount: course.enrollments.length,
    }))

    // Sort by rating if needed (since we can't do this in Prisma easily)
    if (searchParams.sort === "rating") {
      mappedCourses = mappedCourses.sort((a, b) => b.rating - a.rating)
    }

    return {
      courses: mappedCourses,
      total,
      totalPages: Math.ceil(total / COURSES_PER_PAGE),
      currentPage: page,
    }
  } catch (error) {
    console.error("Error fetching courses:", error)
    return {
      courses: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    }
  }
}

async function getCategories() {
  try {
    const courses = await prisma.course.findMany({
      where: { published: true },
    })
    const categories = [...new Set(courses.map((c: any) => c.category).filter(Boolean))]
    return categories
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  let coursesResult: { courses: any[]; total: number; totalPages: number; currentPage: number } = {
    courses: [],
    total: 0,
    totalPages: 0,
    currentPage: 1,
  }
  let categories: string[] = []

  try {
    coursesResult = await getCourses({
      search: resolvedSearchParams.search as string,
      category: resolvedSearchParams.category as string,
      difficulty: resolvedSearchParams.difficulty as string,
      sort: resolvedSearchParams.sort as string,
      page: resolvedSearchParams.page as string,
    })

    categories = await getCategories()
  } catch (error) {
    console.error("Error loading courses page:", error)
  }

  const { courses, total, totalPages, currentPage } = coursesResult

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            All Courses
          </h1>
          <p className="text-lg text-gray-600">
            Discover thousands of courses from expert instructors
          </p>
        </div>

      {categories.length > 0 && (
        <CourseFilters categories={categories} searchParams={resolvedSearchParams} />
      )}

      {courses.length === 0 ? (
        <div className="text-center py-12 sm:py-16 lg:py-20">
          <p className="text-gray-600 text-lg sm:text-xl mb-4">
            {categories.length === 0 
              ? "Unable to connect to database. Please check your database configuration."
              : "No courses found."}
          </p>
          {categories.length === 0 && (
            <p className="text-sm text-gray-500">
              See <code className="bg-gray-100 px-2 py-1 rounded">docs/DATABASE_SETUP.md</code> for setup instructions.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                slug={course.slug}
                description={course.description}
                thumbnailUrl={course.thumbnailUrl}
                instructor={course.instructor}
                category={course.category}
                difficulty={course.difficulty}
                rating={course.rating}
                totalReviews={course.totalReviews}
                enrollments={course.enrollmentCount}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={total}
            />
          )}
        </>
      )}
      </div>
    </div>
  )
}

