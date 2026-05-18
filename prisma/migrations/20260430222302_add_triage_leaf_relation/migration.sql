-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "triageLeafId" TEXT;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_triageLeafId_fkey" FOREIGN KEY ("triageLeafId") REFERENCES "TriageRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
