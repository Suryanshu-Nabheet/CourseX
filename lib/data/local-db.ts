// This file provides a Prisma-like interface using local JSON storage
// It wraps the store functions to match Prisma query patterns

import { users, courses, lessons, enrollments, reviews, payments, wishlist, notes, generateId } from "./store"

// Helper to get related data
function getCourseWithRelations(course: any) {
  const courseLessons = lessons.getByCourse(course.id)
  const courseEnrollments = enrollments.getByCourse(course.id)
  const courseReviews = reviews.getByCourse(course.id)
  const instructor = users.getById(course.instructorId)

  return {
    ...course,
    lessons: courseLessons,
    enrollments: courseEnrollments,
    reviews: courseReviews,
    instructor: instructor ? {
      name: instructor.name,
      image: instructor.image,
      id: instructor.id,
    } : null,
  }
}

// Mock Prisma Client Interface
export const prisma = {
  user: {
    findMany: async (options?: any) => {
      let allUsers = users.getAll()
      
      if (options?.where) {
        const where = options.where
        if (where.email) {
          const user = users.getByEmail(where.email)
          return user ? [user] : []
        }
        if (where.id) {
          const user = users.getById(where.id)
          return user ? [user] : []
        }
        if (where.role) {
          allUsers = allUsers.filter((u: any) => u.role === where.role)
        }
      }

      if (options?.select) {
        return allUsers.map((u: any) => {
          const selected: any = {}
          Object.keys(options.select).forEach((key) => {
            if (options.select[key]) selected[key] = u[key]
          })
          return selected
        })
      }

      return allUsers
    },
    findUnique: async (options: any) => {
      const { where } = options
      if (where.email) return users.getByEmail(where.email)
      if (where.id) return users.getById(where.id)
      return null
    },
    create: async (data: any) => {
      const user = {
        id: generateId(),
        ...data.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return users.create(user)
    },
    update: async (options: any) => {
      const { where, data } = options
      return users.update(where.id, data)
    },
    count: async (options?: any) => {
      let allUsers = users.getAll()
      if (options?.where) {
        if (options.where.role) {
          allUsers = allUsers.filter((u: any) => u.role === options.where.role)
        }
      }
      return allUsers.length
    },
  },

  course: {
    findMany: async (options?: any) => {
      let allCourses = courses.getAll()
      
      if (options?.where) {
        const where = options.where
        if (where.published !== undefined) {
          allCourses = allCourses.filter((c: any) => c.published === where.published)
        }
        if (where.instructorId) {
          allCourses = allCourses.filter((c: any) => c.instructorId === where.instructorId)
        }
        if (where.slug) {
          allCourses = allCourses.filter((c: any) => c.slug === where.slug)
        }
        if (where.category) {
          allCourses = allCourses.filter((c: any) => c.category === where.category)
        }
        if (where.difficulty) {
          allCourses = allCourses.filter((c: any) => c.difficulty === where.difficulty)
        }
        if (where.OR) {
          const orResults: any[] = []
          where.OR.forEach((or: any) => {
            if (or.title?.contains) {
              const term = or.title.contains.toLowerCase()
              allCourses.forEach((c: any) => {
                if (c.title.toLowerCase().includes(term)) orResults.push(c)
              })
            }
            if (or.description?.contains) {
              const term = or.description.contains.toLowerCase()
              allCourses.forEach((c: any) => {
                if (c.description.toLowerCase().includes(term) && !orResults.find(r => r.id === c.id)) {
                  orResults.push(c)
                }
              })
            }
            if (or.instructor?.name?.contains) {
              const term = or.instructor.name.contains.toLowerCase()
              allCourses.forEach((c: any) => {
                const instructor = users.getById(c.instructorId)
                if (instructor?.name.toLowerCase().includes(term) && !orResults.find(r => r.id === c.id)) {
                  orResults.push(c)
                }
              })
            }
          })
          allCourses = orResults
        }
      }

      // Handle includes
      let result = allCourses
      if (options?.include) {
        result = allCourses.map((course: any) => {
          const courseData: any = { ...course }
          
          if (options.include.instructor) {
            const instructor = users.getById(course.instructorId)
            if (instructor && options.include.instructor.select) {
              courseData.instructor = {}
              Object.keys(options.include.instructor.select).forEach((key) => {
                if (options.include.instructor.select[key]) {
                  courseData.instructor[key] = instructor[key]
                }
              })
            } else {
              courseData.instructor = instructor
            }
          }
          
          if (options.include.enrollments) {
            courseData.enrollments = enrollments.getByCourse(course.id)
          }
          
          if (options.include.reviews) {
            courseData.reviews = reviews.getByCourse(course.id)
          }
          
          if (options.include.lessons) {
            courseData.lessons = lessons.getByCourse(course.id)
          }
          
          return courseData
        })
      }

      // Handle orderBy
      if (options?.orderBy) {
        const orderBy = options.orderBy
        if (orderBy.createdAt) {
          result.sort((a: any, b: any) => {
            const aDate = new Date(a.createdAt).getTime()
            const bDate = new Date(b.createdAt).getTime()
            return orderBy.createdAt === "desc" ? bDate - aDate : aDate - bDate
          })
        }
        if (orderBy.reviews) {
          result.sort((a: any, b: any) => {
            const aCount = a.reviews?.length || 0
            const bCount = b.reviews?.length || 0
            return orderBy.reviews._count === "desc" ? bCount - aCount : aCount - bCount
          })
        }
      }

      // Handle pagination
      if (options?.skip !== undefined && options?.take !== undefined) {
        result = result.slice(options.skip, options.skip + options.take)
      } else if (options?.take) {
        result = result.slice(0, options.take)
      }

      // Handle distinct (for getCategories)
      if (options?.select?.distinct) {
        const distinctField = Array.isArray(options.select.distinct) 
          ? options.select.distinct[0] 
          : options.select.distinct
        const distinctValues = [...new Set(result.map((c: any) => c[distinctField]).filter(Boolean))]
        return distinctValues
      }
      
      // Handle select only (without distinct)
      if (options?.select && !options.select.distinct) {
        const selected = Object.keys(options.select).filter(key => options.select[key])
        if (selected.length > 0 && !options.include) {
          result = result.map((item: any) => {
            const filtered: any = {}
            selected.forEach(key => {
              filtered[key] = item[key]
            })
            return filtered
          })
        }
      }

      return result
    },
    findFirst: async (options?: any) => {
      const allCourses = courses.getAll()
      
      if (options?.where) {
        const where = options.where
        let filtered = allCourses
        
        if (where.id) {
          filtered = filtered.filter((c: any) => c.id === where.id)
        }
        if (where.instructorId) {
          filtered = filtered.filter((c: any) => c.instructorId === where.instructorId)
        }
        if (where.published !== undefined) {
          filtered = filtered.filter((c: any) => c.published === where.published)
        }
        
        if (filtered.length > 0) {
          let result = filtered[0]
          
          if (options.include) {
            const courseData: any = { ...result }
            
            if (options.include.lessons) {
              courseData.lessons = lessons.getByCourse(result.id)
              if (options.include.lessons.orderBy) {
                const orderBy = options.include.lessons.orderBy
                if (orderBy.order) {
                  courseData.lessons.sort((a: any, b: any) => {
                    return orderBy.order === "asc" ? a.order - b.order : b.order - a.order
                  })
                }
              }
            }
            
            if (options.include.instructor) {
              courseData.instructor = users.getById(result.instructorId)
            }
            
            return courseData
          }
          
          return result
        }
      }
      
      return null
    },
    findUnique: async (options: any) => {
      const { where } = options
      let course = null
      
      if (where.id) course = courses.getById(where.id)
      if (where.slug && !course) {
        course = courses.getBySlug(where.slug)
      }
      
      // Handle additional where conditions
      if (course && where.published !== undefined && course.published !== where.published) {
        return null
      }
      
      if (!course) return null

      // Handle includes
      if (options?.include) {
        const courseData: any = { ...course }
        
        if (options.include.instructor) {
          const instructor = users.getById(course.instructorId)
          if (instructor && options.include.instructor.select) {
            courseData.instructor = {}
            Object.keys(options.include.instructor.select).forEach((key) => {
              if (options.include.instructor.select[key]) {
                courseData.instructor[key] = instructor[key]
              }
            })
          } else {
            courseData.instructor = instructor
          }
        }
        
        if (options.include.enrollments) {
          courseData.enrollments = enrollments.getByCourse(course.id)
        }
        
        if (options.include.reviews) {
          courseData.reviews = reviews.getByCourse(course.id)
        }
        
        if (options.include.lessons) {
          courseData.lessons = lessons.getByCourse(course.id)
        }
        
        return courseData
      }

      return course
    },
    create: async (data: any) => {
      const course = {
        id: generateId(),
        ...data.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      // Create lessons if provided
      if (data.data.lessons && Array.isArray(data.data.lessons)) {
        const courseId = course.id
        const createdLessons = data.data.lessons.map((lesson: any, index: number) => {
          const lessonData = {
            id: generateId(),
            ...lesson,
            courseId,
            order: lesson.order || index + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          lessons.create(lessonData)
          return lessonData
        })
        course.lessons = createdLessons
      }
      
      return courses.create(course)
    },
    update: async (options: any) => {
      const { where, data } = options
      const course = courses.getById(where.id)
      if (!course) return null

      // Handle lessons update separately
      const updateData = { ...data }
      delete updateData.lessons

      const updatedCourse = courses.update(where.id, updateData)

      if (data.lessons) {
        // Delete existing lessons
        lessons.deleteByCourse(where.id)
        
        // Create new lessons
        data.lessons.forEach((lesson: any, index: number) => {
          const lessonData = {
            id: lesson.id || generateId(),
            ...lesson,
            courseId: where.id,
            order: lesson.order || index + 1,
            createdAt: lesson.id ? lesson.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          if (lesson.id) {
            lessons.update(lesson.id, lessonData)
          } else {
            lessons.create(lessonData)
          }
        })
      }

      return updatedCourse
    },
    delete: async (options: any) => {
      const { where } = options
      lessons.deleteByCourse(where.id)
      return courses.delete(where.id)
    },
    count: async (options?: any) => {
      return courses.count(options?.where ? (c: any) => {
        if (options.where.published !== undefined && c.published !== options.where.published) return false
        if (options.where.instructorId && c.instructorId !== options.where.instructorId) return false
        return true
      } : undefined)
    },
    aggregate: async (options?: any) => {
      const allCourses = courses.getAll()
      if (options?._sum?.price) {
        const sum = allCourses.reduce((acc: number, c: any) => acc + (c.price || 0), 0)
        return { _sum: { price: sum } }
      }
      return { _sum: { price: 0 } }
    },
  },

  lesson: {
    findMany: async (options?: any) => {
      let allLessons = lessons.getAll()
      
      if (options?.where) {
        if (options.where.courseId) {
          allLessons = allLessons.filter((l: any) => l.courseId === options.where.courseId)
        }
      }

      if (options?.orderBy) {
        allLessons.sort((a: any, b: any) => {
          if (options.orderBy.order) {
            return options.orderBy.order === "asc" ? a.order - b.order : b.order - a.order
          }
          return 0
        })
      }

      return allLessons
    },
    findUnique: async (options: any) => {
      const { where } = options
      if (where.id) return lessons.getById(where.id)
      return null
    },
    create: async (data: any) => {
      const lesson = {
        id: generateId(),
        ...data.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return lessons.create(lesson)
    },
    update: async (options: any) => {
      const { where, data } = options
      return lessons.update(where.id, data)
    },
    delete: async (options: any) => {
      const { where } = options
      return lessons.delete(where.id)
    },
  },

  enrollment: {
    findMany: async (options?: any) => {
      let allEnrollments = enrollments.getAll()
      
      if (options?.where) {
        if (options.where.studentId) {
          allEnrollments = allEnrollments.filter((e: any) => e.studentId === options.where.studentId)
        }
        if (options.where.courseId) {
          allEnrollments = allEnrollments.filter((e: any) => e.courseId === options.where.courseId)
        }
      }

      if (options?.include) {
        allEnrollments = allEnrollments.map((enrollment: any) => {
          const enrollmentData: any = { ...enrollment }
          
          if (options.include.course) {
            const course = courses.getById(enrollment.courseId)
            if (course) {
              if (options.include.course.include) {
                enrollmentData.course = getCourseWithRelations(course)
              } else {
                enrollmentData.course = course
              }
            }
          }
          
          if (options.include.user) {
            enrollmentData.user = users.getById(enrollment.studentId)
          }
          
          return enrollmentData
        })
      }

      if (options?.orderBy) {
        if (options.orderBy.updatedAt) {
          allEnrollments.sort((a: any, b: any) => {
            const aDate = new Date(a.updatedAt || a.createdAt).getTime()
            const bDate = new Date(b.updatedAt || b.createdAt).getTime()
            return options.orderBy.updatedAt === "desc" ? bDate - aDate : aDate - bDate
          })
        }
      }

      return allEnrollments
    },
    findUnique: async (options: any) => {
      const { where } = options
      if (where.studentId_courseId) {
        return enrollments.getByStudentAndCourse(
          where.studentId_courseId.studentId,
          where.studentId_courseId.courseId
        )
      }
      if (where.studentId && where.courseId) {
        return enrollments.getByStudentAndCourse(where.studentId, where.courseId)
      }
      if (where.id) {
        return enrollments.getById(where.id)
      }
      return null
    },
    create: async (data: any) => {
      const enrollment = {
        id: generateId(),
        ...data.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return enrollments.create(enrollment)
    },
    update: async (options: any) => {
      const { where, data } = options
      let enrollmentId = where.id
      if (!enrollmentId && where.studentId_courseId) {
        const enrollment = enrollments.getByStudentAndCourse(
          where.studentId_courseId.studentId,
          where.studentId_courseId.courseId
        )
        enrollmentId = enrollment?.id
      }
      if (enrollmentId) {
        return enrollments.update(enrollmentId, data)
      }
      return null
    },
    count: async (options?: any) => {
      return enrollments.count(options?.where ? (e: any) => {
        if (options.where.courseId && e.courseId !== options.where.courseId) return false
        if (options.where.studentId && e.studentId !== options.where.studentId) return false
        return true
      } : undefined)
    },
  },

  review: {
    findMany: async (options?: any) => {
      let allReviews = reviews.getAll()
      
      if (options?.where) {
        if (options.where.courseId) {
          allReviews = allReviews.filter((r: any) => r.courseId === options.where.courseId)
        }
        if (options.where.userId) {
          allReviews = allReviews.filter((r: any) => r.userId === options.where.userId)
        }
      }

      return allReviews
    },
    findUnique: async (options: any) => {
      const { where } = options
      if (where.userId_courseId) {
        return reviews.getAll().find((r: any) => 
          r.userId === where.userId_courseId.userId && 
          r.courseId === where.userId_courseId.courseId
        ) || null
      }
      if (where.id) return reviews.getById(where.id)
      return null
    },
    create: async (data: any) => {
      const review = {
        id: generateId(),
        ...data.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      // Get user info for review
      const user = users.getById(review.userId)
      if (user) {
        review.userName = user.name
        review.userImage = user.image
      }
      
      return reviews.create(review)
    },
    update: async (options: any) => {
      const { where, data } = options
      return reviews.update(where.id, data)
    },
    delete: async (options: any) => {
      const { where } = options
      return reviews.delete(where.id)
    },
    count: async (options?: any) => {
      return reviews.count(options?.where ? (r: any) => {
        if (options.where.courseId && r.courseId !== options.where.courseId) return false
        return true
      } : undefined)
    },
  },

  payment: {
    findMany: async (options?: any) => {
      let allPayments = payments.getAll()
      
      if (options?.where) {
        if (options.where.userId) {
          allPayments = allPayments.filter((p: any) => p.userId === options.where.userId)
        }
        if (options.where.courseId) {
          allPayments = allPayments.filter((p: any) => p.courseId === options.where.courseId)
        }
        if (options.where.status) {
          allPayments = allPayments.filter((p: any) => p.status === options.where.status)
        }
        if (options.where.paymentIntentId) {
          allPayments = allPayments.filter((p: any) => p.paymentIntentId === options.where.paymentIntentId)
        }
      }

      if (options?.orderBy) {
        if (options.orderBy.createdAt) {
          allPayments.sort((a: any, b: any) => {
            const aDate = new Date(a.createdAt).getTime()
            const bDate = new Date(b.createdAt).getTime()
            return options.orderBy.createdAt === "desc" ? bDate - aDate : aDate - bDate
          })
        }
      }

      return allPayments
    },
    findUnique: async (options: any) => {
      const { where } = options
      if (where.id) return payments.getById(where.id)
      if (where.paymentIntentId) return payments.getByPaymentIntentId(where.paymentIntentId)
      return null
    },
    findFirst: async (options?: any) => {
      let allPayments = payments.getAll()
      
      if (options?.where) {
        if (options.where.userId && options.where.courseId) {
          return payments.getByUserAndCourse(options.where.userId, options.where.courseId) || null
        }
      }
      
      return allPayments.length > 0 ? allPayments[0] : null
    },
    create: async (data: any) => {
      const payment = {
        id: generateId(),
        ...data.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return payments.create(payment)
    },
    update: async (options: any) => {
      const { where, data } = options
      if (where.paymentIntentId) {
        return payments.updateByPaymentIntentId(where.paymentIntentId, data)
      }
      return payments.update(where.id, data)
    },
    count: async (options?: any) => {
      return payments.count(options?.where ? (p: any) => {
        if (options.where.userId && p.userId !== options.where.userId) return false
        if (options.where.courseId && p.courseId !== options.where.courseId) return false
        if (options.where.status && p.status !== options.where.status) return false
        return true
      } : undefined)
    },
  },

  wishlist: {
    findMany: async (options?: any) => {
      let allWishlist = wishlist.getAll()
      
      if (options?.where) {
        if (options.where.userId) {
          allWishlist = allWishlist.filter((w: any) => w.userId === options.where.userId)
        }
        if (options.where.courseId) {
          allWishlist = allWishlist.filter((w: any) => w.courseId === options.where.courseId)
        }
      }

      if (options?.include) {
        allWishlist = allWishlist.map((item: any) => {
          const itemData: any = { ...item }
          if (options.include.course) {
            itemData.course = courses.getById(item.courseId)
            if (itemData.course && options.include.course.include) {
              if (options.include.course.include.instructor) {
                itemData.course.instructor = users.getById(itemData.course.instructorId)
              }
            }
          }
          return itemData
        })
      }

      return allWishlist
    },
    findFirst: async (options?: any) => {
      if (options?.where) {
        if (options.where.userId && options.where.courseId) {
          return wishlist.getByUserAndCourse(options.where.userId, options.where.courseId) || null
        }
      }
      return null
    },
    create: async (data: any) => {
      const item = {
        id: generateId(),
        ...data.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return wishlist.create(item)
    },
    deleteMany: async (options?: any) => {
      if (options?.where) {
        if (options.where.userId && options.where.courseId) {
          wishlist.delete(options.where.userId, options.where.courseId)
          return { count: 1 }
        }
      }
      return { count: 0 }
    },
  },

  note: {
    findMany: async (options?: any) => {
      let allNotes = notes.getAll()
      
      if (options?.where) {
        if (options.where.userId) {
          allNotes = allNotes.filter((n: any) => n.userId === options.where.userId)
        }
        if (options.where.lessonId) {
          allNotes = allNotes.filter((n: any) => n.lessonId === options.where.lessonId)
        }
      }

      return allNotes
    },
    findFirst: async (options?: any) => {
      if (options?.where) {
        if (options.where.userId && options.where.lessonId) {
          return notes.getByUserAndLesson(options.where.userId, options.where.lessonId) || null
        }
      }
      return null
    },
    create: async (data: any) => {
      const note = {
        id: generateId(),
        ...data.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return notes.create(note)
    },
    update: async (options: any) => {
      const { where, data } = options
      return notes.update(where.id, data)
    },
    delete: async (options: any) => {
      const { where } = options
      return notes.delete(where.id)
    },
  },
}

