# CourseX LMS - Project Structure

This document describes the well-organized, modular structure of the CourseX Learning Management System codebase.

## 📁 Directory Structure

```
LMS/
├── app/                          # Next.js App Router pages
│   ├── (routes)/                # Route handlers
│   │   ├── auth/                # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── courses/             # Course-related pages
│   │   │   ├── [slug]/          # Course detail page
│   │   │   ├── learn/[courseId]/ # Course player
│   │   │   └── page.tsx         # Courses listing
│   │   ├── dashboard/           # Dashboard pages
│   │   │   ├── student/         # Student dashboard
│   │   │   └── instructor/     # Instructor dashboard
│   │   │       ├── create/     # Create course
│   │   │       ├── edit/[id]/  # Edit course
│   │   │       ├── analytics/   # Analytics page
│   │   │       ├── courses/     # My courses
│   │   │       └── export/      # Export data
│   │   ├── admin/               # Admin pages
│   │   ├── api/                 # API routes
│   │   │   ├── auth/            # Authentication APIs
│   │   │   ├── courses/         # Course APIs
│   │   │   ├── enrollments/     # Enrollment APIs
│   │   │   ├── lessons/         # Lesson APIs
│   │   │   ├── reviews/         # Review APIs
│   │   │   └── payments/        # Payment APIs
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page
│   │   ├── providers.tsx        # App providers
│   │   ├── error.tsx            # Error boundary
│   │   └── not-found.tsx        # 404 page
│
├── components/                   # React components (organized by feature)
│   ├── landing/                 # Landing page components
│   │   ├── HeroSection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── WorldMapSection.tsx
│   │   └── index.ts            # Barrel exports
│   │
│   ├── courses/                  # Course-related components
│   │   ├── CourseCard.tsx
│   │   ├── CourseCardSkeleton.tsx
│   │   ├── CourseFilters.tsx
│   │   ├── CoursePlayer.tsx
│   │   ├── CourseVideoPlayer.tsx
│   │   ├── EnrollButton.tsx
│   │   ├── ExpandableSection.tsx
│   │   ├── ReviewSection.tsx
│   │   ├── CreateCourseForm.tsx
│   │   ├── EditCourseForm.tsx
│   │   ├── Certificate.tsx
│   │   └── index.ts
│   │
│   ├── dashboard/               # Dashboard components
│   │   ├── AnalyticsChart.tsx
│   │   ├── ExportButton.tsx
│   │   ├── ProgressTracker.tsx
│   │   └── index.ts
│   │
│   ├── layout/                  # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── index.ts
│   │
│   ├── shared/                  # Shared/common components
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Pagination.tsx
│   │   ├── SearchBar.tsx
│   │   ├── DatabaseError.tsx
│   │   └── index.ts
│   │
│   └── ui/                      # UI primitives (shadcn/ui)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── toast.tsx
│       └── ...
│
├── lib/                         # Utility libraries and helpers
│   ├── data/                    # Data layer
│   │   ├── store.ts             # Local JSON storage
│   │   └── local-db.ts          # Prisma-like interface
│   ├── auth.ts                  # NextAuth configuration
│   ├── prisma.ts                # Database client
│   ├── payments.ts              # Payment utilities
│   ├── toast.ts                 # Toast notifications
│   └── utils.ts                 # General utilities
│
├── types/                        # TypeScript type definitions
│   ├── api/                     # API types
│   ├── course/                  # Course-related types
│   ├── user/                    # User types
│   ├── enrollment/              # Enrollment types
│   └── next-auth.d.ts           # NextAuth type extensions
│
├── data/                         # Local JSON data files
│   ├── users.json
│   ├── courses.json
│   ├── lessons.json
│   ├── enrollments.json
│   └── reviews.json
│
├── scripts/                      # Utility scripts
│   └── seed-local.ts            # Database seeding
│
├── prisma/                       # Prisma schema (legacy, using local storage)
│   ├── schema.prisma
│   └── seed.ts
│
├── public/                       # Static assets
│   └── Suryanshu_Nabheet.png
│
└── [config files]               # Config files (package.json, tsconfig.json, etc.)
```

## 🎯 Organization Principles

### 1. **Feature-Based Component Organization**
Components are organized by feature/domain rather than by type:
- `components/landing/` - All landing page sections
- `components/courses/` - All course-related components
- `components/dashboard/` - Dashboard-specific components
- `components/layout/` - Layout components (Navbar, Footer, Sidebar)
- `components/shared/` - Reusable components used across features
- `components/ui/` - UI primitives (button, input, card, etc.)

### 2. **Barrel Exports**
Each feature folder has an `index.ts` file for clean imports:
```typescript
// Instead of:
import { HeroSection } from "@/components/landing/HeroSection"

// You can use:
import { HeroSection } from "@/components/landing"
```

### 3. **Data Layer Separation**
All data access is centralized in `lib/data/`:
- `store.ts` - Low-level CRUD operations for JSON storage
- `local-db.ts` - Prisma-like interface wrapping store functions

### 4. **Type Safety**
Types are organized by domain in the `types/` directory for better discoverability.

### 5. **API Routes**
API routes follow Next.js 15 conventions with proper async params:
- `app/api/courses/` - Course CRUD operations
- `app/api/enrollments/` - Enrollment management
- `app/api/reviews/` - Review submission
- `app/api/auth/` - Authentication

## 📦 Import Patterns

### Recommended Import Style:
```typescript
// Feature components
import { CourseCard, EnrollButton } from "@/components/courses"
import { HeroSection, StatsSection } from "@/components/landing"
import { Navbar, Footer } from "@/components/layout"

// Shared components
import { LoadingSpinner, EmptyState } from "@/components/shared"

// UI primitives
import { Button, Card } from "@/components/ui"

// Utilities
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
```

## 🚀 Benefits of This Structure

1. **Scalability**: Easy to add new features without cluttering
2. **Maintainability**: Clear separation of concerns
3. **Discoverability**: Easy to find components by feature
4. **Reusability**: Shared components are clearly separated
5. **Type Safety**: Types organized by domain
6. **Developer Experience**: Clean imports with barrel exports

## 📝 Adding New Features

When adding a new feature (e.g., "Notifications"):

1. Create feature folder: `components/notifications/`
2. Add components: `NotificationCard.tsx`, `NotificationList.tsx`
3. Create index: `components/notifications/index.ts`
4. Add types: `types/notification/`
5. Add API routes: `app/api/notifications/`
6. Add pages: `app/notifications/`

This keeps the codebase organized and maintainable as it grows.

## 🔧 Configuration Files

- `next.config.js` - Next.js configuration with image domains
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration (Next.js 15 compatible)
- `package.json` - Dependencies and scripts

## 📚 Documentation Files

- `README.md` - Main project documentation
- `docs/STRUCTURE.md` - This file (project structure)
- `docs/DATABASE_SETUP.md` - Database setup instructions
- `LOCAL_STORAGE.md` - Local storage documentation
- `QUICK_START.md` - Quick start guide
