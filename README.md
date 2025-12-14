# CourseX - Learning Management System

<div align="center">
  <h3>A modern, full-featured Learning Management System built with Next.js 15, TypeScript, and Tailwind CSS</h3>
  <p>Designed for scalability, maintainability, and an exceptional developer experience</p>
</div>

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## ✨ Features

### 🎓 For Students

- Browse and search courses with advanced filtering
- Purchase courses with secure Stripe payments
- Interactive course player with video lessons
- Track learning progress with detailed analytics
- Submit reviews and ratings
- Wishlist functionality
- Purchase history and certificates

### 👨‍🏫 For Instructors

- Create and manage courses with rich content
- Set pricing and sell courses
- Track revenue and earnings
- View detailed analytics (enrollments, reviews, ratings)
- Export course data
- Comprehensive dashboard

### 🏢 Platform Features

- Role-based authentication (Student/Instructor/Admin)
- Google OAuth + Email/Password login
- Beautiful, modern UI with Framer Motion animations
- Complete payment marketplace
- Revenue tracking and splits
- Local JSON storage (no database setup required for development)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Local JSON Storage (Prisma-ready for PostgreSQL)
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **UI Components**: Radix UI + Custom Components
- **Animations**: Framer Motion

## 📚 Documentation

All documentation is organized in the [`docs/`](./docs/) folder:

- **[Quick Start Guide](./docs/QUICK_START.md)** - Get started in 5 minutes
- **[Database Setup](./docs/DATABASE_SETUP.md)** - Database configuration guide
- **[Architecture](./docs/ARCHITECTURE.md)** - System architecture details
- **[Project Structure](./docs/STRUCTURE.md)** - Directory structure guide
- **[Production Readiness](./docs/PRODUCTION_READINESS.md)** - Production deployment checklist
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Step-by-step deployment instructions
- **[Improvements Plan](./docs/IMPROVEMENTS_PLAN.md)** - Feature roadmap and improvements
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Contributing](./docs/CONTRIBUTING.md)** - Contribution guidelines
- **[Changelog](./docs/CHANGELOG.md)** - Version history

## 📁 Project Structure

```
LMS/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── courses/           # Course pages
│   ├── dashboard/         # Dashboard pages
│   └── checkout/          # Payment checkout
├── components/            # React components (feature-based)
│   ├── courses/           # Course components
│   ├── dashboard/         # Dashboard components
│   ├── landing/           # Landing page components
│   ├── layout/            # Layout components
│   └── shared/            # Shared components
├── lib/                   # Utilities and libraries
│   ├── data/              # Data layer (local storage)
│   ├── email/             # Email notifications
│   └── payments/          # Payment processing
├── docs/                  # 📚 All documentation
└── data/                  # JSON data files
```

## 🎯 Sample Accounts

After running `npm run db:seed`:

**Instructors:**

- Email: `suryanshu@coursex.com` / Password: `password123`

**Students:**

- Email: `john@example.com` / Password: `password123`
- Email: `jane@example.com` / Password: `password123`

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:seed      # Seed local database
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: For Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: For Stripe payments (production)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

See [Production Readiness Guide](./docs/PRODUCTION_READINESS.md) for detailed deployment instructions.

## 🤝 Contributing

See [Contributing Guidelines](./docs/CONTRIBUTING.md) for details on how to contribute.

## 📄 License

MIT License - feel free to use this project for learning and building your own LMS!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by Suryanshu Nabheet**
