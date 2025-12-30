# Quick Setup Guide

## Step 1: Create Environment File

Create a `.env` file in the root directory with the following content:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**Important:** Replace `"your-secret-key-change-this-in-production"` with a secure random string. You can generate one using:

```bash
openssl rand -base64 32
```

Or use an online generator.

## Step 2: Run Database Migrations

```bash
npx prisma migrate dev
npx prisma generate
```

## Step 3: Start Development Server

```bash
npm run dev
```

## Step 4: Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## First Steps

1. **Sign Up** - Create a new account at `/auth/signup`
2. **Create a Community** - Click "Create Community" in the navbar
3. **Join Communities** - Browse and join communities from the home page
4. **Start Posting** - Create posts in communities you've joined
5. **Engage** - Comment on posts to start discussions

Enjoy building your community! 🎉

