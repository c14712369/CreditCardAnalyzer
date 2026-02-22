-- Phase 14: Add StartDate / EndDate to CreditCards table
-- 活動期間屬於卡片層級 (信用卡名稱之下、權益之上)

ALTER TABLE "CreditCards"
ADD COLUMN IF NOT EXISTS "StartDate" date DEFAULT NULL;

ALTER TABLE "CreditCards"
ADD COLUMN IF NOT EXISTS "EndDate" date DEFAULT NULL;

COMMENT ON COLUMN "CreditCards"."StartDate" IS 'Card promotion start date (NULL = no start restriction)';
COMMENT ON COLUMN "CreditCards"."EndDate" IS 'Card promotion end date (NULL = no end restriction / permanent)';
