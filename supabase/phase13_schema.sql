-- Phase 13: Add PaymentMethods to Rewards table

-- Add PaymentMethods column (JSONB array of strings)
-- Example: ["Apple Pay", "Line Pay"]
-- Empty array or null implies "All Payment Methods"
ALTER TABLE "Rewards" 
ADD COLUMN IF NOT EXISTS "PaymentMethods" jsonb DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN "Rewards"."PaymentMethods" IS 'List of supported payment methods for this reward (JSON string array)';

-- Create index for faster filtering (if needed, but dataset is small)
-- CREATE INDEX idx_rewards_payment_methods ON "Rewards" USING GIN ("PaymentMethods");
