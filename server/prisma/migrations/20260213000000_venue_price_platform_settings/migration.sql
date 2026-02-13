-- AlterTable
ALTER TABLE "venues" ADD COLUMN IF NOT EXISTS "pricePerHalfHour" DOUBLE PRECISION DEFAULT 0;

-- CreateTable
CREATE TABLE IF NOT EXISTS "platform_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "platform_settings_key_key" ON "platform_settings"("key");

-- Seed default Ulikme commission (4%)
INSERT INTO "platform_settings" ("id", "key", "value", "updatedAt")
VALUES (gen_random_uuid(), 'ulikme_commission_percent', '4', NOW())
ON CONFLICT ("key") DO NOTHING;
