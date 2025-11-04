# 🚀 Quick Start Guide - Get Your Database Running in 5 Minutes

## Step 1: Set Up Supabase (Free & Easy) ⭐ Recommended

1. **Go to [supabase.com](https://supabase.com)** and click "Start your project"

2. **Sign up** (you can use GitHub, Google, or email)

3. **Create a New Project:**
   - Click "New Project"
   - Enter project name (e.g., "coursex-lms")
   - Enter a strong database password (SAVE THIS!)
   - Choose a region close to you
   - Wait 2-3 minutes for project creation

4. **Get Your Connection String:**
   - Once project is ready, go to **Settings** → **Database**
   - Scroll to "Connection string"
   - Select **URI** tab
   - Copy the connection string (looks like):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```
   - **Important:** Replace `[YOUR-PASSWORD]` with the password you set during project creation

5. **Update Your .env File:**
   
   Open or create `.env` in the project root and add:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```
   
   **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste it as `NEXTAUTH_SECRET` value

6. **Push Database Schema:**
   ```bash
   npm run db:push
   ```

7. **Seed Sample Data (Optional):**
   ```bash
   npm run db:seed
   ```

8. **Restart Your Dev Server:**
   ```bash
   # Stop current server (Ctrl+C) then:
   npm run dev
   ```

## ✅ Verify It's Working

After completing the steps above:

1. Visit `http://localhost:3000`
2. You should see featured courses (if you ran seed)
3. Try creating an account
4. Browse courses without errors

## 🔍 Troubleshooting

### Still seeing database errors?

1. **Double-check your .env file:**
   - Make sure `DATABASE_URL` doesn't have placeholder values
   - Verify the password in the connection string matches your Supabase password
   - No quotes around the URL? Actually, keep the quotes in .env

2. **Test the connection:**
   ```bash
   npx prisma db push
   ```
   If this succeeds, your connection is working!

3. **Check Supabase dashboard:**
   - Go to your project
   - Click "Table Editor" 
   - You should see tables after running `db:push`

4. **Reset database password if forgotten:**
   - Go to Supabase → Settings → Database
   - Click "Reset database password"
   - Update your `.env` file with the new password

### Alternative: Local PostgreSQL

If you prefer local database:

1. Install PostgreSQL:
   ```bash
   brew install postgresql@14
   brew services start postgresql@14
   ```

2. Create database:
   ```bash
   createdb coursex
   ```

3. Update `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/coursex?schema=public"
   ```

4. Run:
   ```bash
   npm run db:push
   ```

## 🎉 You're All Set!

Once your database is connected, the app will:
- Display courses on the homepage
- Allow user registration and login
- Enable course creation and enrollment
- Show all features working properly

Need help? Check `docs/DATABASE_SETUP.md` for more detailed instructions.

