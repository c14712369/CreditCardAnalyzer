-- Phase 15: Categories Table (通路管理)

CREATE TABLE IF NOT EXISTS "Categories" (
    "CategoryID" serial PRIMARY KEY,
    "Name" text NOT NULL UNIQUE,
    "ParentGroup" text NOT NULL DEFAULT '國內' CHECK ("ParentGroup" IN ('國內', '國外')),
    "SortOrder" int NOT NULL DEFAULT 0
);

-- 預設通路資料 (國內)
INSERT INTO "Categories" ("Name", "ParentGroup", "SortOrder") VALUES
('國內一般', '國內', 1),
('超商', '國內', 2),
('餐廳/美食', '國內', 3),
('量販/超市', '國內', 4),
('加油', '國內', 5),
('醫療/保費', '國內', 6),
('電信/繳費', '國內', 7),
('網購/電商', '國內', 8),
('影音串流', '國內', 9),
('外送平台', '國內', 10),
('交通運輸', '國內', 11),
('旅遊住宿', '國內', 12)
ON CONFLICT ("Name") DO NOTHING;

-- 預設通路資料 (國外)
INSERT INTO "Categories" ("Name", "ParentGroup", "SortOrder") VALUES
('國外一般', '國外', 1)
ON CONFLICT ("Name") DO NOTHING;

-- RLS
ALTER TABLE "Categories" ENABLE ROW LEVEL SECURITY;

-- 所有人可讀
CREATE POLICY "categories_read_all" ON "Categories"
    FOR SELECT USING (true);

-- 認證用戶可寫
CREATE POLICY "categories_write_auth" ON "Categories"
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
