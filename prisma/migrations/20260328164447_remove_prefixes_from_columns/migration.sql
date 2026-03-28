/*
  Warnings:

  - The primary key for the `Agent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `agt_canAnswer` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `agt_id` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `agt_supportLevel` on the `Agent` table. All the data in the column will be lost.
  - The primary key for the `AgentGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `agg_agentId` on the `AgentGroup` table. All the data in the column will be lost.
  - You are about to drop the column `agg_assignedAt` on the `AgentGroup` table. All the data in the column will be lost.
  - You are about to drop the column `agg_supportGroupId` on the `AgentGroup` table. All the data in the column will be lost.
  - The primary key for the `Company` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `com_accessCode` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `com_cnpj` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `com_contactEmail` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `com_contactName` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `com_deletedAt` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `com_id` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `com_isActive` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `com_name` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `com_updatedAt` on the `Company` table. All the data in the column will be lost.
  - The primary key for the `SupportGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `spg_createdAt` on the `SupportGroup` table. All the data in the column will be lost.
  - You are about to drop the column `spg_deletedAt` on the `SupportGroup` table. All the data in the column will be lost.
  - You are about to drop the column `spg_description` on the `SupportGroup` table. All the data in the column will be lost.
  - You are about to drop the column `spg_id` on the `SupportGroup` table. All the data in the column will be lost.
  - You are about to drop the column `spg_isActive` on the `SupportGroup` table. All the data in the column will be lost.
  - You are about to drop the column `spg_name` on the `SupportGroup` table. All the data in the column will be lost.
  - You are about to drop the column `spg_updatedAt` on the `SupportGroup` table. All the data in the column will be lost.
  - The primary key for the `Ticket` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tkt_agentId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `tkt_clientId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `tkt_closedAt` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `tkt_companyId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `tkt_createdAt` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `tkt_id` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `tkt_priority` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `tkt_ratingComment` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `tkt_ratingScore` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `tkt_status` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `tkt_subjectId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `tkt_supportGroupId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `tkt_updatedAt` on the `Ticket` table. All the data in the column will be lost.
  - The primary key for the `TicketHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tkh_actionType` on the `TicketHistory` table. All the data in the column will be lost.
  - You are about to drop the column `tkh_createdAt` on the `TicketHistory` table. All the data in the column will be lost.
  - You are about to drop the column `tkh_fromAgentId` on the `TicketHistory` table. All the data in the column will be lost.
  - You are about to drop the column `tkh_fromGroupId` on the `TicketHistory` table. All the data in the column will be lost.
  - You are about to drop the column `tkh_fromStatus` on the `TicketHistory` table. All the data in the column will be lost.
  - You are about to drop the column `tkh_id` on the `TicketHistory` table. All the data in the column will be lost.
  - You are about to drop the column `tkh_ticketId` on the `TicketHistory` table. All the data in the column will be lost.
  - You are about to drop the column `tkh_toAgentId` on the `TicketHistory` table. All the data in the column will be lost.
  - You are about to drop the column `tkh_toGroupId` on the `TicketHistory` table. All the data in the column will be lost.
  - You are about to drop the column `tkh_toStatus` on the `TicketHistory` table. All the data in the column will be lost.
  - The primary key for the `TicketSubject` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tks_createdAt` on the `TicketSubject` table. All the data in the column will be lost.
  - You are about to drop the column `tks_description` on the `TicketSubject` table. All the data in the column will be lost.
  - You are about to drop the column `tks_id` on the `TicketSubject` table. All the data in the column will be lost.
  - You are about to drop the column `tks_isActive` on the `TicketSubject` table. All the data in the column will be lost.
  - You are about to drop the column `tks_name` on the `TicketSubject` table. All the data in the column will be lost.
  - You are about to drop the column `tks_updatedAt` on the `TicketSubject` table. All the data in the column will be lost.
  - The primary key for the `TriageRule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `nod_answerTrigger` on the `TriageRule` table. All the data in the column will be lost.
  - You are about to drop the column `nod_id` on the `TriageRule` table. All the data in the column will be lost.
  - You are about to drop the column `nod_isLeaf` on the `TriageRule` table. All the data in the column will be lost.
  - You are about to drop the column `nod_parentId` on the `TriageRule` table. All the data in the column will be lost.
  - You are about to drop the column `nod_question` on the `TriageRule` table. All the data in the column will be lost.
  - You are about to drop the column `nod_targetGroupId` on the `TriageRule` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `usr_chatStatus` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_companyId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_deletedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_hashedPassword` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_lastLogin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_lastSeen` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_resetTknExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_resetToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `usr_updatedAt` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cnpj]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactEmail]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accessCode]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `canAnswer` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supportLevel` to the `Agent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `agentId` to the `AgentGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supportGroupId` to the `AgentGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accessCode` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cnpj` to the `Company` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Company` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `SupportGroup` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `SupportGroup` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name` to the `SupportGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SupportGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Ticket` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updatedAt` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actionType` to the `TicketHistory` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `TicketHistory` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `ticketId` to the `TicketHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `TicketSubject` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `TicketSubject` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `isActive` to the `TicketSubject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `TicketSubject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TicketSubject` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `TriageRule` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `companyId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hashedPassword` to the `User` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_agt_id_fkey";

-- DropForeignKey
ALTER TABLE "AgentGroup" DROP CONSTRAINT "AgentGroup_agg_agentId_fkey";

-- DropForeignKey
ALTER TABLE "AgentGroup" DROP CONSTRAINT "AgentGroup_agg_supportGroupId_fkey";

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
ALTER TABLE "TicketHistory" DROP CONSTRAINT "TicketHistory_tkh_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "TicketHistory" DROP CONSTRAINT "TicketHistory_tkh_toAgentId_fkey";

-- DropForeignKey
ALTER TABLE "TicketHistory" DROP CONSTRAINT "TicketHistory_tkh_toGroupId_fkey";

-- DropForeignKey
ALTER TABLE "TriageRule" DROP CONSTRAINT "TriageRule_nod_parentId_fkey";

-- DropForeignKey
ALTER TABLE "TriageRule" DROP CONSTRAINT "TriageRule_nod_targetGroupId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_usr_companyId_fkey";

-- DropIndex
DROP INDEX "Company_com_accessCode_key";

-- DropIndex
DROP INDEX "Company_com_cnpj_key";

-- DropIndex
DROP INDEX "Company_com_contactEmail_key";

-- DropIndex
DROP INDEX "User_usr_email_key";

-- DropIndex
DROP INDEX "User_usr_phone_key";

-- AlterTable
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_pkey",
DROP COLUMN "agt_canAnswer",
DROP COLUMN "agt_id",
DROP COLUMN "agt_supportLevel",
ADD COLUMN     "canAnswer" BOOLEAN NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "supportLevel" TEXT NOT NULL,
ADD CONSTRAINT "Agent_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "AgentGroup" DROP CONSTRAINT "AgentGroup_pkey",
DROP COLUMN "agg_agentId",
DROP COLUMN "agg_assignedAt",
DROP COLUMN "agg_supportGroupId",
ADD COLUMN     "agentId" TEXT NOT NULL,
ADD COLUMN     "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "supportGroupId" TEXT NOT NULL,
ADD CONSTRAINT "AgentGroup_pkey" PRIMARY KEY ("agentId", "supportGroupId");

-- AlterTable
ALTER TABLE "Company" DROP CONSTRAINT "Company_pkey",
DROP COLUMN "com_accessCode",
DROP COLUMN "com_cnpj",
DROP COLUMN "com_contactEmail",
DROP COLUMN "com_contactName",
DROP COLUMN "com_deletedAt",
DROP COLUMN "com_id",
DROP COLUMN "com_isActive",
DROP COLUMN "com_name",
DROP COLUMN "com_updatedAt",
ADD COLUMN     "accessCode" TEXT NOT NULL,
ADD COLUMN     "cnpj" TEXT NOT NULL,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Company_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "SupportGroup" DROP CONSTRAINT "SupportGroup_pkey",
DROP COLUMN "spg_createdAt",
DROP COLUMN "spg_deletedAt",
DROP COLUMN "spg_description",
DROP COLUMN "spg_id",
DROP COLUMN "spg_isActive",
DROP COLUMN "spg_name",
DROP COLUMN "spg_updatedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "SupportGroup_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_pkey",
DROP COLUMN "tkt_agentId",
DROP COLUMN "tkt_clientId",
DROP COLUMN "tkt_closedAt",
DROP COLUMN "tkt_companyId",
DROP COLUMN "tkt_createdAt",
DROP COLUMN "tkt_id",
DROP COLUMN "tkt_priority",
DROP COLUMN "tkt_ratingComment",
DROP COLUMN "tkt_ratingScore",
DROP COLUMN "tkt_status",
DROP COLUMN "tkt_subjectId",
DROP COLUMN "tkt_supportGroupId",
DROP COLUMN "tkt_updatedAt",
ADD COLUMN     "agentId" TEXT,
ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "priority" "TicketPriority",
ADD COLUMN     "ratingComment" TEXT,
ADD COLUMN     "ratingScore" INTEGER,
ADD COLUMN     "status" "TicketStatus" NOT NULL DEFAULT 'TRIAGE',
ADD COLUMN     "subjectId" TEXT,
ADD COLUMN     "supportGroupId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TicketHistory" DROP CONSTRAINT "TicketHistory_pkey",
DROP COLUMN "tkh_actionType",
DROP COLUMN "tkh_createdAt",
DROP COLUMN "tkh_fromAgentId",
DROP COLUMN "tkh_fromGroupId",
DROP COLUMN "tkh_fromStatus",
DROP COLUMN "tkh_id",
DROP COLUMN "tkh_ticketId",
DROP COLUMN "tkh_toAgentId",
DROP COLUMN "tkh_toGroupId",
DROP COLUMN "tkh_toStatus",
ADD COLUMN     "actionType" "TicketAction" NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fromAgentId" TEXT,
ADD COLUMN     "fromGroupId" TEXT,
ADD COLUMN     "fromStatus" "TicketStatus",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "ticketId" TEXT NOT NULL,
ADD COLUMN     "toAgentId" TEXT,
ADD COLUMN     "toGroupId" TEXT,
ADD COLUMN     "toStatus" "TicketStatus",
ADD CONSTRAINT "TicketHistory_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TicketSubject" DROP CONSTRAINT "TicketSubject_pkey",
DROP COLUMN "tks_createdAt",
DROP COLUMN "tks_description",
DROP COLUMN "tks_id",
DROP COLUMN "tks_isActive",
DROP COLUMN "tks_name",
DROP COLUMN "tks_updatedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "TicketSubject_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TriageRule" DROP CONSTRAINT "TriageRule_pkey",
DROP COLUMN "nod_answerTrigger",
DROP COLUMN "nod_id",
DROP COLUMN "nod_isLeaf",
DROP COLUMN "nod_parentId",
DROP COLUMN "nod_question",
DROP COLUMN "nod_targetGroupId",
ADD COLUMN     "answerTrigger" TEXT,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isLeaf" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "question" TEXT,
ADD COLUMN     "targetGroupId" TEXT,
ADD CONSTRAINT "TriageRule_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "usr_chatStatus",
DROP COLUMN "usr_companyId",
DROP COLUMN "usr_createdAt",
DROP COLUMN "usr_deletedAt",
DROP COLUMN "usr_email",
DROP COLUMN "usr_hashedPassword",
DROP COLUMN "usr_id",
DROP COLUMN "usr_isActive",
DROP COLUMN "usr_lastLogin",
DROP COLUMN "usr_lastSeen",
DROP COLUMN "usr_name",
DROP COLUMN "usr_phone",
DROP COLUMN "usr_resetTknExpires",
DROP COLUMN "usr_resetToken",
DROP COLUMN "usr_role",
DROP COLUMN "usr_updatedAt",
ADD COLUMN     "chatStatus" "ChatStatus" NOT NULL DEFAULT 'OFFLINE',
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "hashedPassword" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "lastSeen" TIMESTAMP(3),
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "resetTknExpires" TIMESTAMP(3),
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CLIENT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Company_cnpj_key" ON "Company"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Company_contactEmail_key" ON "Company"("contactEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Company_accessCode_key" ON "Company"("accessCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentGroup" ADD CONSTRAINT "AgentGroup_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentGroup" ADD CONSTRAINT "AgentGroup_supportGroupId_fkey" FOREIGN KEY ("supportGroupId") REFERENCES "SupportGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_supportGroupId_fkey" FOREIGN KEY ("supportGroupId") REFERENCES "SupportGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "TicketSubject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketHistory" ADD CONSTRAINT "TicketHistory_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketHistory" ADD CONSTRAINT "TicketHistory_fromGroupId_fkey" FOREIGN KEY ("fromGroupId") REFERENCES "SupportGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketHistory" ADD CONSTRAINT "TicketHistory_toGroupId_fkey" FOREIGN KEY ("toGroupId") REFERENCES "SupportGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketHistory" ADD CONSTRAINT "TicketHistory_fromAgentId_fkey" FOREIGN KEY ("fromAgentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketHistory" ADD CONSTRAINT "TicketHistory_toAgentId_fkey" FOREIGN KEY ("toAgentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriageRule" ADD CONSTRAINT "TriageRule_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TriageRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriageRule" ADD CONSTRAINT "TriageRule_targetGroupId_fkey" FOREIGN KEY ("targetGroupId") REFERENCES "SupportGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
