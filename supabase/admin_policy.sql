-- 開啟 RLS (若尚未開啟)
ALTER TABLE "CreditCards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Rewards"     ENABLE ROW LEVEL SECURITY;

-- 1. 允許所有人讀取 (已在 init.sql 中建立，此處僅為完整性示意)
-- CREATE POLICY "Allow public read CreditCards" ON "CreditCards" FOR SELECT USING (true);
-- CREATE POLICY "Allow public read Rewards"     ON "Rewards"     FOR SELECT USING (true);

-- 2. 允許已登入使用者 (管理員) 進行新增、修改、刪除
-- CreditCards 表單的寫入權限
CREATE POLICY "Allow authenticated insert CreditCards"
  ON "CreditCards" FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update CreditCards"
  ON "CreditCards" FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete CreditCards"
  ON "CreditCards" FOR DELETE
  TO authenticated
  USING (true);

-- Rewards 表單的寫入權限
CREATE POLICY "Allow authenticated insert Rewards"
  ON "Rewards" FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update Rewards"
  ON "Rewards" FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete Rewards"
  ON "Rewards" FOR DELETE
  TO authenticated
  USING (true);
