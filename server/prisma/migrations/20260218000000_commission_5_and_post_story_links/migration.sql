-- Update Ulikme commission from 4% to 5% (or insert if not exists)
INSERT INTO "platform_settings" ("id", "key", "value", "updatedAt")
VALUES (gen_random_uuid(), 'ulikme_commission_percent', '5', NOW())
ON CONFLICT ("key") DO UPDATE SET "value" = '5', "updatedAt" = NOW();

-- Add classId and communityId to Post (creator can link post to a class or community)
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "classId" TEXT;
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "communityId" TEXT;

-- Add classId and communityId to Story (creator can link story to a class or community)
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "classId" TEXT;
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "communityId" TEXT;

-- Foreign keys for Post
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_classId_fkey'
  ) THEN
    ALTER TABLE "posts" ADD CONSTRAINT "posts_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_communityId_fkey'
  ) THEN
    ALTER TABLE "posts" ADD CONSTRAINT "posts_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Foreign keys for Story
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stories_classId_fkey'
  ) THEN
    ALTER TABLE "stories" ADD CONSTRAINT "stories_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stories_communityId_fkey'
  ) THEN
    ALTER TABLE "stories" ADD CONSTRAINT "stories_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "posts_classId_idx" ON "posts"("classId");
CREATE INDEX IF NOT EXISTS "posts_communityId_idx" ON "posts"("communityId");
CREATE INDEX IF NOT EXISTS "stories_classId_idx" ON "stories"("classId");
CREATE INDEX IF NOT EXISTS "stories_communityId_idx" ON "stories"("communityId");
