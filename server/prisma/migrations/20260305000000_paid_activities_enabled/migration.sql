-- 4.7: Add paid_activities_enabled platform setting (default false = everything free initially)
INSERT INTO "platform_settings" ("id", "key", "value", "updatedAt")
VALUES (gen_random_uuid(), 'paid_activities_enabled', 'false', NOW())
ON CONFLICT ("key") DO NOTHING;
