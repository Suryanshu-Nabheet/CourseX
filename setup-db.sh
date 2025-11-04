#!/bin/bash

echo "🚀 CourseX Database Setup"
echo "========================="
echo ""
echo "Choose your database option:"
echo "1) Use Supabase (Recommended - Free, Cloud-hosted)"
echo "2) Use Local PostgreSQL"
echo "3) Skip (I'll set it up manually)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo ""
    echo "📝 Supabase Setup:"
    echo "1. Go to https://supabase.com and sign up"
    echo "2. Create a new project"
    echo "3. Wait for project to be created (~2 min)"
    echo "4. Go to Settings → Database"
    echo "5. Copy the 'Connection string' (URI)"
    echo "6. Replace [YOUR-PASSWORD] with your database password"
    echo ""
    read -p "Paste your Supabase DATABASE_URL here: " db_url
    if [ ! -z "$db_url" ]; then
      # Update .env file
      sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=\"$db_url\"|" .env
      echo "✅ Updated DATABASE_URL in .env"
    fi
    ;;
  2)
    echo ""
    echo "📝 Local PostgreSQL Setup:"
    read -p "Enter PostgreSQL username (default: postgres): " pg_user
    pg_user=${pg_user:-postgres}
    read -p "Enter PostgreSQL password: " -s pg_pass
    echo ""
    read -p "Enter database name (default: coursex): " db_name
    db_name=${db_name:-coursex}
    
    db_url="postgresql://${pg_user}:${pg_pass}@localhost:5432/${db_name}?schema=public"
    sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=\"$db_url\"|" .env
    echo "✅ Updated DATABASE_URL in .env"
    
    # Try to create database
    echo ""
    echo "Attempting to create database..."
    createdb -U "$pg_user" "$db_name" 2>/dev/null && echo "✅ Database created" || echo "⚠️  Could not create database (may already exist or need manual creation)"
    ;;
  3)
    echo ""
    echo "📝 Manual Setup:"
    echo "Edit your .env file and update DATABASE_URL with your connection string"
    exit 0
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "🔄 Generating Prisma Client..."
npx prisma generate

echo ""
echo "📤 Pushing schema to database..."
npx prisma db push

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Database setup complete!"
  echo ""
  read -p "Would you like to seed the database with sample data? (y/n): " seed
  if [ "$seed" = "y" ] || [ "$seed" = "Y" ]; then
    echo ""
    echo "🌱 Seeding database..."
    npm run db:seed
    echo ""
    echo "✅ Setup complete! You can now run 'npm run dev'"
  fi
else
  echo ""
  echo "❌ Database setup failed. Please check your DATABASE_URL in .env"
  echo "See docs/DATABASE_SETUP.md for troubleshooting"
fi

