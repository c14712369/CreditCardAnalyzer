-- Phase 7 Schema 更新
-- 1. CreditCards 新增 Note 欄位
ALTER TABLE "CreditCards" ADD COLUMN IF NOT EXISTS "Note" TEXT;

-- 2. Rewards 新增 PlanName 欄位
ALTER TABLE "Rewards" ADD COLUMN IF NOT EXISTS "PlanName" VARCHAR(50);
