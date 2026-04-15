-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TicketAction" ADD VALUE 'STATUS_CHANGE';
ALTER TYPE "TicketAction" ADD VALUE 'ARCHIVE';
ALTER TYPE "TicketAction" ADD VALUE 'UNARCHIVE';
ALTER TYPE "TicketAction" ADD VALUE 'SOFT_DELETE';

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Ticket_companyId_isArchived_deletedAt_idx" ON "Ticket"("companyId", "isArchived", "deletedAt");

-- CreateIndex
CREATE INDEX "Ticket_clientId_isArchived_deletedAt_idx" ON "Ticket"("clientId", "isArchived", "deletedAt");

-- CreateIndex
CREATE INDEX "Ticket_agentId_isArchived_deletedAt_idx" ON "Ticket"("agentId", "isArchived", "deletedAt");

-- CreateIndex
CREATE INDEX "Ticket_supportGroupId_isArchived_deletedAt_idx" ON "Ticket"("supportGroupId", "isArchived", "deletedAt");

-- CreateIndex
CREATE INDEX "Ticket_status_isArchived_deletedAt_idx" ON "Ticket"("status", "isArchived", "deletedAt");
