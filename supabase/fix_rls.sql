-- 修復與重設 RLS 權限策略
-- 請在 Supabase SQL Editor 執行此腳本

-- =========================================================
-- 1. CreditCards 表單權限
-- =========================================================
ALTER TABLE "CreditCards" ENABLE ROW LEVEL SECURITY;

-- 讀取 (公開)
DROP POLICY IF EXISTS "Allow public read CreditCards" ON "CreditCards";
CREATE POLICY "Allow public read CreditCards" ON "CreditCards" FOR SELECT USING (true);

-- 新增 (需登入)
DROP POLICY IF EXISTS "Allow authenticated insert CreditCards" ON "CreditCards";
CREATE POLICY "Allow authenticated insert CreditCards" ON "CreditCards" FOR INSERT TO authenticated WITH CHECK (true);

-- 修改 (需登入)
DROP POLICY IF EXISTS "Allow authenticated update CreditCards" ON "CreditCards";
CREATE POLICY "Allow authenticated update CreditCards" ON "CreditCards" FOR UPDATE TO authenticated USING (true);

-- 刪除 (需登入)
DROP POLICY IF EXISTS "Allow authenticated delete CreditCards" ON "CreditCards";
CREATE POLICY "Allow authenticated delete CreditCards" ON "CreditCards" FOR DELETE TO authenticated USING (true);


-- =========================================================
-- 2. Rewards 表單權限
-- =========================================================
ALTER TABLE "Rewards" ENABLE ROW LEVEL SECURITY;

-- 讀取 (公開)
DROP POLICY IF EXISTS "Allow public read Rewards" ON "Rewards";
CREATE POLICY "Allow public read Rewards" ON "Rewards" FOR SELECT USING (true);

-- 新增 (需登入)
DROP POLICY IF EXISTS "Allow authenticated insert Rewards" ON "Rewards";
CREATE POLICY "Allow authenticated insert Rewards" ON "Rewards" FOR INSERT TO authenticated WITH CHECK (true);

-- 修改 (需登入)
DROP POLICY IF EXISTS "Allow authenticated update Rewards" ON "Rewards";
CREATE POLICY "Allow authenticated update Rewards" ON "Rewards" FOR UPDATE TO authenticated USING (true);

-- 刪除 (需登入)
DROP POLICY IF EXISTS "Allow authenticated delete Rewards" ON "Rewards";
CREATE POLICY "Allow authenticated delete Rewards" ON "Rewards" FOR DELETE TO authenticated USING (true);
