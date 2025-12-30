-- Add image support to messages
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "image" TEXT;

