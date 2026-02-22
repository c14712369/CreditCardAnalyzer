-- ====================================================
-- 信用卡回饋比較網站 - 資料庫初始化腳本
-- 請將此腳本貼至 Supabase → SQL Editor 執行
-- ====================================================

-- 1. 建立 CreditCards 資料表
CREATE TABLE IF NOT EXISTS "CreditCards" (
  "CardID"        SERIAL PRIMARY KEY,
  "BankName"      VARCHAR(50)  NOT NULL,
  "CardName"      VARCHAR(100) NOT NULL,
  "IsDirectDeduct" BOOLEAN     NOT NULL DEFAULT FALSE,
  "RequireSwitch" BOOLEAN      NOT NULL DEFAULT FALSE
);

-- 2. 建立 Rewards 資料表
CREATE TABLE IF NOT EXISTS "Rewards" (
  "RewardID"     SERIAL PRIMARY KEY,
  "CardID"       INTEGER      NOT NULL REFERENCES "CreditCards"("CardID") ON DELETE CASCADE,
  "Category"     VARCHAR(50)  NOT NULL,
  "RewardRate"   NUMERIC(5,2) NOT NULL,
  "MonthlyLimit" INTEGER      NULL
);

-- 3. 建立索引（加速通路查詢）
CREATE INDEX IF NOT EXISTS idx_rewards_cardid   ON "Rewards"("CardID");
CREATE INDEX IF NOT EXISTS idx_rewards_category ON "Rewards"("Category");

-- 4. 設定 RLS (Row Level Security) - 允許公開讀取
ALTER TABLE "CreditCards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Rewards"     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read CreditCards"
  ON "CreditCards" FOR SELECT USING (true);

CREATE POLICY "Allow public read Rewards"
  ON "Rewards" FOR SELECT USING (true);

-- ====================================================
-- 5. 插入測試假資料
-- ====================================================

INSERT INTO "CreditCards" ("BankName", "CardName", "IsDirectDeduct", "RequireSwitch")
VALUES
  ('玉山銀行', 'Pi 拍錢包信用卡', TRUE,  FALSE),
  ('國泰世華', 'CUBE 卡',         TRUE,  TRUE),
  ('台新銀行', '@GoGo 卡',        FALSE, FALSE);

INSERT INTO "Rewards" ("CardID", "Category", "RewardRate", "MonthlyLimit")
VALUES
  -- Pi 拍錢包信用卡 (CardID=1)
  (1, '國內一般', 2.50,  60),
  (1, 'LINE Pay', 2.50,  60),
  -- CUBE 卡 (CardID=2)
  (2, '國內一般', 3.00, 100),
  (2, '海外',     2.00, NULL),
  -- @GoGo 卡 (CardID=3)
  (3, '國內一般', 1.00, NULL),
  (3, 'LINE Pay', 3.00,  80);
