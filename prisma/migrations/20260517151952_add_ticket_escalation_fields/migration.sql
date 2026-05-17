-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "escalationCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastAgentId" TEXT,
ADD COLUMN     "lastEscalationComment" TEXT,
ADD COLUMN     "supportLevel" "SupportLevel";

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_lastAgentId_fkey" FOREIGN KEY ("lastAgentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
