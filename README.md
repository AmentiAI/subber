# Subber - Community Platform

A next-generation platform for connecting with communities, inspired by the original Subber platform.

## Features

- 🔐 **User Authentication** - Secure sign up and sign in
- 👥 **Community Management** - Create and join communities
- 💬 **Posts & Discussions** - Share posts and engage in discussions
- 💭 **Comments** - Comment on posts to keep conversations going
- 👤 **User Profiles** - Manage your profile and see your communities
- 🎨 **Modern UI** - Beautiful, responsive design with dark mode support

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Prisma** - Modern ORM for database management
- **NextAuth.js v5** - Authentication
- **Tailwind CSS** - Utility-first CSS framework
- **SQLite** - Database (easily switchable to PostgreSQL/MySQL)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd subber
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
subber/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── communities/       # Community pages
│   ├── posts/             # Post pages
│   └── profile/           # User profile
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/                # Database schema and migrations
└── types/                 # TypeScript type definitions
```

## Database Schema

- **User** - User accounts and authentication
- **Community** - Communities that users can join
- **CommunityMember** - Relationship between users and communities
- **Post** - Posts within communities
- **Comment** - Comments on posts

## Features in Detail

### Communities
- Browse all communities on the home page
- Create new communities
- Join communities to participate
- View community details and member counts

### Posts
- Create posts in communities you're a member of
- View all posts in a community
- Click on posts to view full content and comments

### Comments
- Comment on any post
- View all comments on a post
- Real-time comment updates

### Authentication
- Secure password-based authentication
- Session management
- Protected routes

## Development

### Database Migrations

When you make changes to the Prisma schema:

```bash
npx prisma migrate dev --name your_migration_name
npx prisma generate
```

### View Database

Use Prisma Studio to view and edit your database:

```bash
npx prisma studio
```

## Production Deployment

1. Update your `.env` file with production values:
   - Use a production database (PostgreSQL recommended)
   - Set a strong `NEXTAUTH_SECRET`
   - Update `NEXTAUTH_URL` to your production URL

2. Build the application:
```bash
npm run build
```

3. Start the production server:
```bash
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
