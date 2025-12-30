-- Portfolio system for user profiles
CREATE TABLE IF NOT EXISTS "Portfolio" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  link TEXT,
  tags TEXT[],
  "order" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_user ON "Portfolio"("userId", "order" ASC);
CREATE INDEX IF NOT EXISTS idx_portfolio_created ON "Portfolio"("createdAt" DESC);

