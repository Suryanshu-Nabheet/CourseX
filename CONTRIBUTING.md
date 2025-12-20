# Contributing to CourseX

Thank you for your interest in contributing to CourseX! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## 🤝 Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/your-feature-name`
5. Make your changes
6. Test your changes: `pnpm build`
7. Commit and push: `git push origin feature/your-feature-name`
8. Open a Pull Request

## 🏗️ Project Structure

The project follows a **feature-based architecture**:

- `components/landing/` - Landing page components
- `components/courses/` - Course-related components
- `components/dashboard/` - Dashboard components
- `components/layout/` - Layout components (Navbar, Footer, Sidebar)
- `components/shared/` - Shared/reusable components
- `components/ui/` - UI primitives (shadcn/ui)

See [docs/STRUCTURE.md](../docs/STRUCTURE.md) for detailed documentation.

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new files
- Avoid `any` types when possible
- Use proper type definitions in `types/` directory

### Components

- Use functional components with hooks
- Add `"use client"` directive for client components
- Keep components focused and single-purpose
- Export from feature folders using `index.ts` (barrel exports)

### Styling

- Use Tailwind CSS for styling
- Follow existing design patterns
- Ensure responsive design (mobile-first)
- Use semantic HTML

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE` or `camelCase.ts`

### Imports

```typescript
// ✅ Good - Feature-based imports
import { CourseCard, EnrollButton } from "@/components/courses";
import { Navbar, Footer } from "@/components/layout";

// ❌ Avoid - Direct file imports
import { CourseCard } from "@/components/courses/CourseCard";
```

## 🔄 Development Workflow

1. **Create a feature branch** from `main`
2. **Make changes** following coding standards
3. **Test locally**: `pnpm dev`
4. **Build check**: `pnpm build`
5. **Lint check**: `pnpm lint`
6. **Commit** with clear messages
7. **Push** to your fork
8. **Create PR** with description

## 📦 Adding New Features

### Adding a New Component

1. Determine the feature folder (e.g., `components/courses/`)
2. Create component file: `NewComponent.tsx`
3. Add export to `index.ts`:
   ```typescript
   export { NewComponent } from "./NewComponent";
   ```
4. Update imports in consuming files

### Adding a New Page

1. Create route in `app/` directory
2. Follow Next.js 15 App Router conventions
3. Use async Server Components when possible
4. Add proper error handling

### Adding API Routes

1. Create route in `app/api/` directory
2. Use proper HTTP methods (GET, POST, PUT, DELETE)
3. Add error handling
4. Return appropriate status codes

## 💬 Commit Guidelines

Use conventional commit messages:

```
feat: Add course search functionality
fix: Resolve enrollment progress tracking bug
docs: Update README with new features
style: Format code with Prettier
refactor: Reorganize components folder structure
test: Add tests for CourseCard component
chore: Update dependencies
```

## 🔍 Pull Request Process

1. **Title**: Clear, descriptive title
2. **Description**: Explain what and why
3. **Screenshots**: For UI changes
4. **Testing**: Describe how you tested
5. **Checklist**: Mark relevant items

### PR Checklist

- [ ] Code follows project standards
- [ ] All tests pass
- [ ] Build succeeds (`npm run build`)
- [ ] No linting errors
- [ ] Documentation updated (if needed)
- [ ] Changes are backward compatible (if applicable)

## 🐛 Reporting Issues

1. Check existing issues first
2. Use issue templates
3. Provide reproduction steps
4. Include relevant logs/screenshots
5. Specify environment details

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Project Structure](./docs/STRUCTURE.md)

## ❓ Questions?

Open an issue or discussion for questions about contributing.

---

Thank you for contributing to CourseX! 🎉
