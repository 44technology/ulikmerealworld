-- CreateTable
CREATE TABLE "community_admin_requests" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "respondedBy" TEXT,

    CONSTRAINT "community_admin_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "community_admin_requests_communityId_userId_key" ON "community_admin_requests"("communityId", "userId");

-- CreateIndex
CREATE INDEX "community_admin_requests_communityId_idx" ON "community_admin_requests"("communityId");

-- CreateIndex
CREATE INDEX "community_admin_requests_userId_idx" ON "community_admin_requests"("userId");

-- CreateIndex
CREATE INDEX "community_admin_requests_status_idx" ON "community_admin_requests"("status");

-- AddForeignKey
ALTER TABLE "community_admin_requests" ADD CONSTRAINT "community_admin_requests_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_admin_requests" ADD CONSTRAINT "community_admin_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
