-- Migration file for new community management features
-- Run these SQL commands to add the new features

-- 1. Add pinned posts support
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "isPinned" BOOLEAN DEFAULT false;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "pinnedAt" TIMESTAMP;

-- 2. Add post categories/tags
CREATE TABLE IF NOT EXISTS "Tag" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3b82f6',
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "PostTag" (
  "postId" TEXT NOT NULL REFERENCES "Post"(id) ON DELETE CASCADE,
  "tagId" TEXT NOT NULL REFERENCES "Tag"(id) ON DELETE CASCADE,
  PRIMARY KEY ("postId", "tagId")
);

-- 3. Add community rules
ALTER TABLE "Community" ADD COLUMN IF NOT EXISTS "rules" TEXT;
ALTER TABLE "Community" ADD COLUMN IF NOT EXISTS "guidelines" TEXT;

-- 4. Add moderation features
CREATE TABLE IF NOT EXISTS "Report" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "reportedById" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  "postId" TEXT REFERENCES "Post"(id) ON DELETE CASCADE,
  "commentId" TEXT REFERENCES "Comment"(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "resolvedAt" TIMESTAMP,
  "resolvedById" TEXT REFERENCES "User"(id)
);

-- 5. Add community analytics tracking
CREATE TABLE IF NOT EXISTS "CommunityAnalytics" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "communityId" TEXT NOT NULL REFERENCES "Community"(id) ON DELETE CASCADE,
  "date" DATE NOT NULL,
  "newMembers" INTEGER DEFAULT 0,
  "newPosts" INTEGER DEFAULT 0,
  "newComments" INTEGER DEFAULT 0,
  "views" INTEGER DEFAULT 0,
  UNIQUE("communityId", "date")
);

-- 6. Add activity log
CREATE TABLE IF NOT EXISTS "Activity" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "communityId" TEXT NOT NULL REFERENCES "Community"(id) ON DELETE CASCADE,
  "userId" TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  "type" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- 7. Add member roles (enhance existing CommunityMember)
-- Already has role field, but let's add more roles
-- admin, moderator, member (already exists)

-- 8. Add community settings
ALTER TABLE "Community" ADD COLUMN IF NOT EXISTS "settings" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE "Community" ADD COLUMN IF NOT EXISTS "themeColor" TEXT DEFAULT '#3b82f6';
ALTER TABLE "Community" ADD COLUMN IF NOT EXISTS "bannerImage" TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_pinned ON "Post"("isPinned", "pinnedAt" DESC);
CREATE INDEX IF NOT EXISTS idx_post_community_created ON "Post"("communityId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_report_status ON "Report"(status);
CREATE INDEX IF NOT EXISTS idx_activity_community ON "Activity"("communityId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_community_date ON "CommunityAnalytics"("communityId", "date" DESC);

