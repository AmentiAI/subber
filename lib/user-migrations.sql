-- User profile enhancements
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profilePicture" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bannerImage" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "website" TEXT;

-- Follow system
CREATE TABLE IF NOT EXISTS "Follow" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "followerId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "followingId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("followerId", "followingId"),
  CHECK("followerId" != "followingId")
);

-- Messaging system
CREATE TABLE IF NOT EXISTS "Conversation" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user1Id" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "user2Id" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "lastMessageAt" TIMESTAMP DEFAULT NOW(),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("user1Id", "user2Id"),
  CHECK("user1Id" != "user2Id")
);

CREATE TABLE IF NOT EXISTS "Message" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "conversationId" TEXT NOT NULL REFERENCES "Conversation"(id) ON DELETE CASCADE,
  "senderId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  "readAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_follow_follower ON "Follow"("followerId");
CREATE INDEX IF NOT EXISTS idx_follow_following ON "Follow"("followingId");
CREATE INDEX IF NOT EXISTS idx_conversation_users ON "Conversation"("user1Id", "user2Id");
CREATE INDEX IF NOT EXISTS idx_message_conversation ON "Message"("conversationId", "createdAt" DESC);

