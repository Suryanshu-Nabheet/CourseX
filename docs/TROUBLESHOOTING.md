# Troubleshooting Guide

## Database Connection Issues

### Error: "User was denied access on the database"

This means your `DATABASE_URL` in `.env` is using placeholder credentials.

**Solution:**

1. **Use Supabase (Easiest):**
   - Go to [supabase.com](https://supabase.com)
   - Sign up and create a project
   - Go to Settings → Database
   - Copy the connection string (URI format)
   - Update your `.env` file:
     ```env
     DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
     ```

2. **Then run:**
   ```bash
   npx prisma generate
   npm run db:push
   npm run db:seed
   ```

### Error: App crashes when database is unavailable

✅ **Fixed!** All database queries now have error handling. The app will:
- Display empty states instead of crashing
- Show helpful messages when database isn't connected
- Log errors to console for debugging

## Common Issues

### 1. Prisma Client not generated

**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
npx prisma generate
```

### 2. Database schema out of sync

**Error:** `Unknown column` or schema mismatch

**Solution:**
```bash
npm run db:push
```

### 3. Next.js build errors

**Error:** Type errors or compilation issues

**Solution:**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### 4. Module not found errors

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

1. **Always check your `.env` file** - Make sure `DATABASE_URL` is set correctly
2. **Check the terminal** - Error messages in console often show the root cause
3. **Verify database connection** - Run `npx prisma db push` to test connection
4. **Clear Next.js cache** - Sometimes `rm -rf .next` fixes weird errors

## Getting Help

If you're still experiencing issues:

1. Check the browser console for client-side errors
2. Check the terminal/server logs for server-side errors
3. Verify your database is running and accessible
4. Make sure all environment variables are set correctly

