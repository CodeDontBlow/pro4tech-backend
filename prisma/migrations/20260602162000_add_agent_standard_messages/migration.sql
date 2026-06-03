CREATE TABLE "AgentStandardMessage" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentStandardMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AgentStandardMessage_agentId_trigger_key" ON "AgentStandardMessage"("agentId", "trigger");
CREATE INDEX "AgentStandardMessage_companyId_idx" ON "AgentStandardMessage"("companyId");
CREATE INDEX "AgentStandardMessage_agentId_idx" ON "AgentStandardMessage"("agentId");

ALTER TABLE "AgentStandardMessage" ADD CONSTRAINT "AgentStandardMessage_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentStandardMessage" ADD CONSTRAINT "AgentStandardMessage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
