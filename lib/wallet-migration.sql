-- Add wallet address support to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "walletAddress" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_wallet ON "User"("walletAddress") WHERE "walletAddress" IS NOT NULL;

-- Make email nullable since we're using wallet addresses
ALTER TABLE "User" ALTER COLUMN email DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN password DROP NOT NULL;

