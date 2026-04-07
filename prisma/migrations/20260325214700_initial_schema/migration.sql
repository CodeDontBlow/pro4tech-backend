-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'AGENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "ChatStatus" AS ENUM ('OFFLINE', 'ONLINE', 'BUSY', 'AWAY');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('TRIAGE', 'OPENED', 'ESCALATED', 'CLOSED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'HIGHEST');

-- CreateEnum
CREATE TYPE "TicketAction" AS ENUM ('ESCALATION', 'RETURN');

-- CreateTable
CREATE TABLE "User" (
    "usr_id" SERIAL NOT NULL,
    "usr_company" INTEGER NOT NULL,
    "usr_phone" TEXT,
    "usr_email" TEXT NOT NULL,
    "usr_hashedPassword" TEXT NOT NULL,
    "usr_name" TEXT NOT NULL,
    "usr_role" "Role" NOT NULL DEFAULT 'CLIENT',
    "usr_chatStatus" "ChatStatus" NOT NULL DEFAULT 'OFFLINE',
    "usr_lastSeen" TIMESTAMP(3),
    "usr_isActive" BOOLEAN NOT NULL DEFAULT true,
    "usr_resetToken" TEXT,
    "usr_resetTknExpires" TIMESTAMP(3),
    "usr_createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usr_updatedAt" TIMESTAMP(3) NOT NULL,
    "usr_deletedAt" TIMESTAMP(3),
    "usr_lastLogin" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("usr_id")
);

-- CreateTable
CREATE TABLE "Company" (
    "com_id" SERIAL NOT NULL,
    "com_cnpj" TEXT NOT NULL,
    "com_name" TEXT NOT NULL,
    "com_contactName" TEXT,
    "com_contactEmail" TEXT,
    "com_accessCode" TEXT NOT NULL,
    "com_isActive" BOOLEAN NOT NULL DEFAULT true,
    "com_updatedAt" TIMESTAMP(3) NOT NULL,
    "com_deletedAt" TIMESTAMP(3),

    CONSTRAINT "Company_pkey" PRIMARY KEY ("com_id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "agt_id" INTEGER NOT NULL,
    "agt_supportLevel" TEXT NOT NULL,
    "agt_canAnswer" BOOLEAN NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("agt_id")
);

-- CreateTable
CREATE TABLE "SupportGroup" (
    "spg_id" SERIAL NOT NULL,
    "spg_name" TEXT NOT NULL,
    "spg_description" TEXT NOT NULL,
    "spg_isActive" BOOLEAN NOT NULL DEFAULT true,
    "spg_createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "spg_updatedAt" TIMESTAMP(3) NOT NULL,
    "spg_deletedAt" TIMESTAMP(3),

    CONSTRAINT "SupportGroup_pkey" PRIMARY KEY ("spg_id")
);

-- CreateTable
CREATE TABLE "AgentGroup" (
    "agg_agent" INTEGER NOT NULL,
    "agg_supportGroup" INTEGER NOT NULL,
    "agg_assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentGroup_pkey" PRIMARY KEY ("agg_agent","agg_supportGroup")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "tkt_id" SERIAL NOT NULL,
    "tkt_companyId" INTEGER NOT NULL,
    "tkt_clientId" INTEGER NOT NULL,
    "tkt_agentId" INTEGER,
    "tkt_supportGroupId" INTEGER,
    "tkt_subjectId" INTEGER,
    "tkt_status" "TicketStatus" NOT NULL DEFAULT 'TRIAGE',
    "tkt_priority" "TicketPriority" DEFAULT 'MEDIUM',
    "tkt_ratingScore" INTEGER,
    "tkt_ratingComment" TEXT,
    "tkt_createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tkt_updatedAt" TIMESTAMP(3) NOT NULL,
    "tkt_closedAt" TIMESTAMP(3),

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("tkt_id")
);

-- CreateTable
CREATE TABLE "TicketHistory" (
    "tkh_id" SERIAL NOT NULL,
    "tkh_fromStatus" "TicketStatus",
    "tkh_toStatus" "TicketStatus",
    "tkh_fromGroupId" INTEGER,
    "tkh_toGroupId" INTEGER,
    "tkh_fromAgentId" INTEGER,
    "tkh_toAgentId" INTEGER,
    "tkh_actionType" "TicketAction" NOT NULL,
    "tkh_createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketHistory_pkey" PRIMARY KEY ("tkh_id")
);

-- CreateTable
CREATE TABLE "TicketSubject" (
    "tks_id" SERIAL NOT NULL,
    "tks_name" TEXT NOT NULL,
    "tks_description" TEXT NOT NULL,
    "tks_isActive" BOOLEAN NOT NULL,
    "tks_createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tks_updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketSubject_pkey" PRIMARY KEY ("tks_id")
);

-- CreateTable
CREATE TABLE "TriageRule" (
    "nod_id" SERIAL NOT NULL,
    "nod_parentId" INTEGER,
    "nod_question" TEXT,
    "nod_answerTrigger" TEXT,
    "nod_isLeaf" BOOLEAN NOT NULL DEFAULT false,
    "nod_targetGroupId" INTEGER,

    CONSTRAINT "TriageRule_pkey" PRIMARY KEY ("nod_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_usr_phone_key" ON "User"("usr_phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_usr_email_key" ON "User"("usr_email");

-- CreateIndex
CREATE UNIQUE INDEX "Company_com_cnpj_key" ON "Company"("com_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Company_com_contactEmail_key" ON "Company"("com_contactEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Company_com_accessCode_key" ON "Company"("com_accessCode");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_usr_company_fkey" FOREIGN KEY ("usr_company") REFERENCES "Company"("com_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_agt_id_fkey" FOREIGN KEY ("agt_id") REFERENCES "User"("usr_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentGroup" ADD CONSTRAINT "AgentGroup_agg_agent_fkey" FOREIGN KEY ("agg_agent") REFERENCES "Agent"("agt_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentGroup" ADD CONSTRAINT "AgentGroup_agg_supportGroup_fkey" FOREIGN KEY ("agg_supportGroup") REFERENCES "SupportGroup"("spg_id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
