# CourseX Architecture Documentation

## System Architecture

CourseX follows a **feature-based, modular architecture** designed for scalability and maintainability.

## Architecture Principles

### 1. **Feature-Based Organization**
Components and logic are organized by feature/domain rather than by technical layer:

```
components/
├── landing/        # Landing page features
├── courses/        # Course management features
├── dashboard/      # Dashboard features
├── layout/         # Layout features
└── shared/         # Cross-cutting concerns
```

### 2. **Separation of Concerns**

- **Presentation Layer**: React components in `components/`
- **Business Logic**: API routes in `app/api/`
- **Data Layer**: Data access in `lib/data/`
- **Utilities**: Helper functions in `lib/`

### 3. **Type Safety First**

- TypeScript throughout
- Type definitions in `types/` organized by domain
- Proper type inference and explicit typing

### 4. **Modular Design**

- Barrel exports for clean imports
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)

## Directory Structure Details

### `/app` - Next.js App Router

#### Routes
- `auth/` - Authentication pages (login, register)
- `courses/` - Course pages (listing, detail, learning)
- `dashboard/` - User dashboards (student, instructor)
- `api/` - API endpoints

#### Special Files
- `layout.tsx` - Root layout with providers
- `page.tsx` - Landing page
- `providers.tsx` - React context providers
- `error.tsx` - Error boundary
- `not-found.tsx` - 404 page

### `/components` - React Components

#### Feature Folders

**`landing/`** - Landing page sections
- `HeroSection.tsx` - Hero with CTA
- `StatsSection.tsx` - Statistics display
- `TestimonialsSection.tsx` - Student testimonials
- `FeaturesSection.tsx` - Feature highlights
- `WorldMapSection.tsx` - Global network visualization
- `index.ts` - Barrel exports

**`courses/`** - Course-related components
- `CourseCard.tsx` - Course card display
- `CourseCardSkeleton.tsx` - Loading state
- `CourseFilters.tsx` - Filtering/sorting UI
- `CoursePlayer.tsx` - Video player interface
- `CourseVideoPlayer.tsx` - Video player wrapper
- `EnrollButton.tsx` - Enrollment action
- `ExpandableSection.tsx` - Accordion component
- `ReviewSection.tsx` - Reviews display
- `CreateCourseForm.tsx` - Course creation
- `EditCourseForm.tsx` - Course editing
- `Certificate.tsx` - Certificate display
- `index.ts` - Barrel exports

**`dashboard/`** - Dashboard components
- `AnalyticsChart.tsx` - Data visualization
- `ExportButton.tsx` - Data export
- `ProgressTracker.tsx` - Progress display
- `index.ts` - Barrel exports

**`layout/`** - Layout components
- `Navbar.tsx` - Global navigation
- `Footer.tsx` - Site footer
- `Sidebar.tsx` - Dashboard sidebar
- `index.ts` - Barrel exports

**`shared/`** - Shared components
- `LoadingSpinner.tsx` - Loading indicator
- `EmptyState.tsx` - Empty state display
- `Pagination.tsx` - Pagination controls
- `SearchBar.tsx` - Search input
- `DatabaseError.tsx` - Error display
- `index.ts` - Barrel exports

**`ui/`** - UI Primitives (shadcn/ui)
- Base components (button, input, card, etc.)
- Form components (select, textarea)
- Feedback components (toast, alert)
- Layout components (skeleton, progress)

### `/lib` - Libraries and Utilities

#### `/lib/data` - Data Layer
- `store.ts` - Low-level JSON storage operations
- `local-db.ts` - Prisma-like interface wrapper

#### Core Libraries
- `auth.ts` - NextAuth configuration
- `prisma.ts` - Database client (points to local-db)
- `payments.ts` - Payment utilities
- `toast.ts` - Toast notification utilities
- `utils.ts` - General utilities (cn, generateSlug, etc.)

### `/types` - TypeScript Types

Organized by domain:
- `api/` - API request/response types
- `course/` - Course-related types
- `user/` - User-related types
- `enrollment/` - Enrollment types
- `next-auth.d.ts` - NextAuth extensions

### `/data` - Local Storage

JSON files for local data persistence:
- `users.json`
- `courses.json`
- `lessons.json`
- `enrollments.json`
- `reviews.json`

### `/scripts` - Utility Scripts

- `seed-local.ts` - Database seeding script

## Data Flow

### Request Flow

1. **User Action** → Component
2. **Component** → API Route (if needed)
3. **API Route** → Data Layer (`lib/data/`)
4. **Data Layer** → JSON Storage (`data/`)
5. **Response** → Component Update

### Authentication Flow

1. User submits credentials
2. `lib/auth.ts` validates
3. NextAuth creates session
4. Session stored in JWT
5. Protected routes check session

### Course Display Flow

1. Page fetches course data
2. Server Component calls `prisma.course.findUnique()`
3. `local-db.ts` queries `store.ts`
4. `store.ts` reads JSON file
5. Data returned to component
6. Component renders UI

## Design Patterns

### 1. **Server/Client Component Split**

- **Server Components** (default): Data fetching, SEO
- **Client Components** (`"use client"`): Interactivity, animations

### 2. **Barrel Exports**

Clean imports using `index.ts`:
```typescript
// components/courses/index.ts
export { CourseCard } from "./CourseCard"
export { EnrollButton } from "./EnrollButton"

// Usage
import { CourseCard, EnrollButton } from "@/components/courses"
```

### 3. **Composition over Inheritance**

Components are composed, not inherited:
```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### 4. **Type-Safe API Routes**

All API routes use TypeScript with proper types:
```typescript
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
)
```

## Security Considerations

### Authentication
- Password hashing with bcryptjs
- JWT-based sessions
- Role-based access control
- Protected API routes

### Data Validation
- Input validation in API routes
- Type checking with TypeScript
- Zod schema validation (where applicable)

### Best Practices
- No sensitive data in client components
- Server-side data fetching
- Proper error handling

## Performance Optimizations

### Code Splitting
- Automatic with Next.js App Router
- Dynamic imports for heavy components

### Image Optimization
- Next.js Image component
- Automatic format optimization
- Responsive images

### Caching
- Static generation where possible
- Server-side caching for data

## Scalability Considerations

### Adding New Features

1. **Create feature folder**: `components/new-feature/`
2. **Add components**: Create component files
3. **Add barrel export**: `index.ts`
4. **Add types**: `types/new-feature/`
5. **Add API routes**: `app/api/new-feature/`
6. **Add pages**: `app/new-feature/`

### Database Migration

When moving from local storage to real database:

1. Update `lib/prisma.ts` to use real PrismaClient
2. Run migrations: `npx prisma migrate dev`
3. Update seed script if needed
4. Test thoroughly

### Code Organization Tips

- **Keep components small**: Single responsibility
- **Use composition**: Build complex UIs from simple components
- **Share utilities**: Put reusable logic in `lib/`
- **Type everything**: Use TypeScript properly
- **Document complex logic**: Add comments for clarity

## Testing Strategy

### Unit Tests (Future)
- Component tests with React Testing Library
- Utility function tests
- API route tests

### Integration Tests (Future)
- End-to-end user flows
- Database integration
- Authentication flows

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Patterns](https://reactpatterns.com/)
- [Feature-Based Architecture](https://kentcdodds.com/blog/colocation)

---

This architecture is designed to scale with your needs while maintaining code quality and developer experience.
