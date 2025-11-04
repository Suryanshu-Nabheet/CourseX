# Database Setup Guide

This LMS supports two storage options:

## Option 1: Local JSON Storage (Default - No Setup Required) ⭐ Recommended for Development

The application uses local JSON storage by default, which means **no database setup is required**. All data is stored in JSON files in the `/data` directory.

### Quick Start with Local Storage

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Seed the local database:**
   ```bash
   npm run db:seed
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

That's it! The app will work with local JSON storage. No database connection needed.

### Data Files

The local storage creates these files in the `/data` directory:
- `users.json` - User accounts
- `courses.json` - Course data
- `lessons.json` - Lesson content
- `enrollments.json` - Student enrollments
- `reviews.json` - Course reviews

These files are automatically created when you run the seed script.

---

## Option 2: PostgreSQL Database (For Production)

If you want to use a PostgreSQL database (recommended for production), follow these steps:

### Using Supabase (Free & Easy) ⭐ Recommended

1. **Sign up at [supabase.com](https://supabase.com)**

2. **Create a new project:**
   - Click "New Project"
   - Enter project name and password (save the password!)
   - Wait 2-3 minutes for project creation

3. **Get your connection string:**
   - Go to **Settings** → **Database**
   - Scroll to "Connection string"
   - Select **URI** tab
   - Copy the connection string
   - Replace `[YOUR-PASSWORD]` with your actual password

4. **Create `.env` file:**
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

   Generate `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

5. **Update Prisma configuration:**
   
   Since the project currently uses local storage, you'll need to switch to Prisma:
   - Update `lib/prisma.ts` to use actual Prisma client instead of local-db
   - Or create a new implementation that uses Prisma

6. **Push schema to database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

7. **Seed the database (optional):**
   ```bash
   npm run db:seed
   ```

### Using Local PostgreSQL

1. **Install PostgreSQL:**
   ```bash
   # macOS
   brew install postgresql@14
   brew services start postgresql@14
   
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Create database:**
   ```bash
   createdb coursex
   ```

3. **Create `.env` file:**
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/coursex?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Push schema:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed the database:**
   ```bash
   npm run db:seed
   ```

---

## Troubleshooting

### "Unable to connect to database" Error

If you see this error with local JSON storage:

1. **Check if data files exist:**
   ```bash
   ls -la data/
   ```
   You should see: `users.json`, `courses.json`, `lessons.json`, `enrollments.json`, `reviews.json`

2. **Run the seed script:**
   ```bash
   npm run db:seed
   ```

3. **Verify data files are not empty:**
   ```bash
   cat data/courses.json
   ```
   Should show an array with course data (not `[]`)

### "User was denied access" Error (PostgreSQL)

This means your `DATABASE_URL` has incorrect credentials:

1. **For Supabase:**
   - Verify the password in your connection string matches your Supabase project password
   - Check if you replaced `[YOUR-PASSWORD]` with the actual password

2. **For Local PostgreSQL:**
   - Verify username and password are correct
   - Check if PostgreSQL service is running:
     ```bash
     # macOS
     brew services list
     
     # Linux
     sudo systemctl status postgresql
     ```

### Database Connection Test

To test your PostgreSQL connection:

```bash
npx prisma db push
```

If this succeeds, your connection is working!

---

## Quick Setup Script

You can also use the automated setup script:

```bash
chmod +x setup-db.sh
./setup-db.sh
```

This script will:
1. Ask you to choose between Supabase or local PostgreSQL
2. Help you configure the `.env` file
3. Generate Prisma client
4. Push the schema to your database
5. Optionally seed the database

---

## Which Option Should I Use?

- **Local JSON Storage**: Perfect for development, testing, and learning. No setup required.
- **PostgreSQL (Supabase)**: Best for production, collaboration, or when you need a real database.

For most users starting out, **local JSON storage is recommended** - just run `npm run db:seed` and you're ready to go!

---

## Need Help?

- Check `docs/TROUBLESHOOTING.md` for common issues
- See `docs/QUICK_START.md` for a step-by-step guide
- Review `README.md` for general project information

