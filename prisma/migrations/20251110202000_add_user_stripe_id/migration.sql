-- Add optional stripeId to users for Stripe customer linkage
ALTER TABLE "User" ADD COLUMN "stripeId" TEXT;

-- Ensure each Stripe customer is unique
CREATE UNIQUE INDEX "User_stripeId_key" ON "User"("stripeId") WHERE "stripeId" IS NOT NULL;
