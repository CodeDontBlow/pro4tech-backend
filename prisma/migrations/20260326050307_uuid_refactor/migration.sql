/*
  Warnings:

  - The primary key for the `Agent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `AgentGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `agg_agent` on the `AgentGroup` table. All the data in the column will be lost.
  - You are about to drop the column `agg_supportGroup` on the `AgentGroup` table. All the data in the column will be lost.
  - The primary key for the `Company` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SupportGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Ticket` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TicketHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TicketSubject` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `TriageRule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `usr_company` on the `User` table. All the data in the column will be lost.
  - Added the required column `agg_agentId` to the `AgentGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `agg_supportGroupId` to the `AgentGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tkh_ticketId` to the `TicketHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usr_companyId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_agt_id_fkey";

-- DropForeignKey
ALTER TABLE "AgentGroup" DROP CONSTRAINT "AgentGroup_agg_agent_fkey";

-- DropForeignKey
ALTER TABLE "AgentGroup" DROP CONSTRAINT "AgentGroup_agg_supportGroup_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_tkt_agentId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_tkt_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_tkt_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_tkt_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_tkt_supportGroupId_fkey";

-- DropForeignKey
ALTER TABLE "TicketHistory" DROP CONSTRAINT "TicketHistory_tkh_fromAgentId_fkey";

-- DropForeignKey
ALTER TABLE "TicketHistory" DROP CONSTRAINT "TicketHistory_tkh_fromGroupId_fkey";

-- DropForeignKey
ALTER TABLE "TicketHistory" DROP CONSTRAINT "TicketHistory_tkh_toAgentId_fkey";

-- DropForeignKey
ALTER TABLE "TicketHistory" DROP CONSTRAINT "TicketHistory_tkh_toGroupId_fkey";

-- DropForeignKey
ALTER TABLE "TriageRule" DROP CONSTRAINT "TriageRule_nod_parentId_fkey";

-- DropForeignKey
ALTER TABLE "TriageRule" DROP CONSTRAINT "TriageRule_nod_targetGroupId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_usr_company_fkey";

-- AlterTable
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_pkey",
ALTER COLUMN "agt_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Agent_pkey" PRIMARY KEY ("agt_id");

-- AlterTable
ALTER TABLE "AgentGroup" DROP CONSTRAINT "AgentGroup_pkey",
DROP COLUMN "agg_agent",
DROP COLUMN "agg_supportGroup",
ADD COLUMN     "agg_agentId" TEXT NOT NULL,
ADD COLUMN     "agg_supportGroupId" TEXT NOT NULL,
ADD CONSTRAINT "AgentGroup_pkey" PRIMARY KEY ("agg_agentId", "agg_supportGroupId");

-- AlterTable
ALTER TABLE "Company" DROP CONSTRAINT "Company_pkey",
ALTER COLUMN "com_id" DROP DEFAULT,
ALTER COLUMN "com_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Company_pkey" PRIMARY KEY ("com_id");
DROP SEQUENCE "Company_com_id_seq";

-- AlterTable
ALTER TABLE "SupportGroup" DROP CONSTRAINT "SupportGroup_pkey",
ALTER COLUMN "spg_id" DROP DEFAULT,
ALTER COLUMN "spg_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "SupportGroup_pkey" PRIMARY KEY ("spg_id");
DROP SEQUENCE "SupportGroup_spg_id_seq";

-- AlterTable
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_pkey",
ALTER COLUMN "tkt_id" DROP DEFAULT,
ALTER COLUMN "tkt_id" SET DATA TYPE TEXT,
ALTER COLUMN "tkt_companyId" SET DATA TYPE TEXT,
ALTER COLUMN "tkt_clientId" SET DATA TYPE TEXT,
ALTER COLUMN "tkt_agentId" SET DATA TYPE TEXT,
ALTER COLUMN "tkt_supportGroupId" SET DATA TYPE TEXT,
ALTER COLUMN "tkt_subjectId" SET DATA TYPE TEXT,
ALTER COLUMN "tkt_priority" DROP DEFAULT,
ADD CONSTRAINT "Ticket_pkey" PRIMARY KEY ("tkt_id");
DROP SEQUENCE "Ticket_tkt_id_seq";

-- AlterTable
ALTER TABLE "TicketHistory" DROP CONSTRAINT "TicketHistory_pkey",
ADD COLUMN     "tkh_ticketId" TEXT NOT NULL,
ALTER COLUMN "tkh_id" DROP DEFAULT,
ALTER COLUMN "tkh_id" SET DATA TYPE TEXT,
ALTER COLUMN "tkh_fromGroupId" SET DATA TYPE TEXT,
ALTER COLUMN "tkh_toGroupId" SET DATA TYPE TEXT,
ALTER COLUMN "tkh_fromAgentId" SET DATA TYPE TEXT,
ALTER COLUMN "tkh_toAgentId" SET DATA TYPE TEXT,
ADD CONSTRAINT "TicketHistory_pkey" PRIMARY KEY ("tkh_id");
DROP SEQUENCE "TicketHistory_tkh_id_seq";

-- AlterTable
ALTER TABLE "TicketSubject" DROP CONSTRAINT "TicketSubject_pkey",
ALTER COLUMN "tks_id" DROP DEFAULT,
ALTER COLUMN "tks_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "TicketSubject_pkey" PRIMARY KEY ("tks_id");
DROP SEQUENCE "TicketSubject_tks_id_seq";

-- AlterTable
ALTER TABLE "TriageRule" DROP CONSTRAINT "TriageRule_pkey",
ALTER COLUMN "nod_id" DROP DEFAULT,
ALTER COLUMN "nod_id" SET DATA TYPE TEXT,
ALTER COLUMN "nod_parentId" SET DATA TYPE TEXT,
ALTER COLUMN "nod_targetGroupId" SET DATA TYPE TEXT,
ADD CONSTRAINT "TriageRule_pkey" PRIMARY KEY ("nod_id");
DROP SEQUENCE "TriageRule_nod_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "usr_company",
ADD COLUMN     "usr_companyId" TEXT NOT NULL,
ALTER COLUMN "usr_id" DROP DEFAULT,
ALTER COLUMN "usr_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("usr_id");
DROP SEQUENCE "User_usr_id_seq";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_usr_companyId_fkey" FOREIGN KEY ("usr_companyId") REFERENCES "Company"("com_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_agt_id_fkey" FOREIGN KEY ("agt_id") REFERENCES "User"("usr_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentGroup" ADD CONSTRAINT "AgentGroup_agg_agentId_fkey" FOREIGN KEY ("agg_agentId") REFERENCES "Agent"("agt_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentGroup" ADD CONSTRAINT "AgentGroup_agg_supportGroupId_fkey" FOREIGN KEY ("agg_supportGroupId") REFERENCES "SupportGroup"("spg_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_tkt_clientId_fkey" FOREIGN KEY ("tkt_clientId") REFERENCES "User"("usr_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_tkt_agentId_fkey" FOREIGN KEY ("tkt_agentId") REFERENCES "Agent"("agt_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_tkt_companyId_fkey" FOREIGN KEY ("tkt_companyId") REFERENCES "Company"("com_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_tkt_supportGroupId_fkey" FOREIGN KEY ("tkt_supportGroupId") REFERENCES "SupportGroup"("spg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_tkt_subjectId_fkey" FOREIGN KEY ("tkt_subjectId") REFERENCES "TicketSubject"("tks_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketHistory" ADD CONSTRAINT "TicketHistory_tkh_ticketId_fkey" FOREIGN KEY ("tkh_ticketId") REFERENCES "Ticket"("tkt_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketHistory" ADD CONSTRAINT "TicketHistory_tkh_fromGroupId_fkey" FOREIGN KEY ("tkh_fromGroupId") REFERENCES "SupportGroup"("spg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketHistory" ADD CONSTRAINT "TicketHistory_tkh_toGroupId_fkey" FOREIGN KEY ("tkh_toGroupId") REFERENCES "SupportGroup"("spg_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketHistory" ADD CONSTRAINT "TicketHistory_tkh_fromAgentId_fkey" FOREIGN KEY ("tkh_fromAgentId") REFERENCES "Agent"("agt_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketHistory" ADD CONSTRAINT "TicketHistory_tkh_toAgentId_fkey" FOREIGN KEY ("tkh_toAgentId") REFERENCES "Agent"("agt_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriageRule" ADD CONSTRAINT "TriageRule_nod_parentId_fkey" FOREIGN KEY ("nod_parentId") REFERENCES "TriageRule"("nod_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriageRule" ADD CONSTRAINT "TriageRule_nod_targetGroupId_fkey" FOREIGN KEY ("nod_targetGroupId") REFERENCES "SupportGroup"("spg_id") ON DELETE SET NULL ON UPDATE CASCADE;
