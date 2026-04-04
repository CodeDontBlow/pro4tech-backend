-- Add subjectId column to TriageRule
ALTER TABLE "TriageRule" ADD COLUMN "subjectId" TEXT;

-- Add unique constraint on name in TicketSubject
ALTER TABLE "TicketSubject" ADD CONSTRAINT "TicketSubject_name_key" UNIQUE ("name");

-- Add unique constraint on subjectId in TriageRule
ALTER TABLE "TriageRule" ADD CONSTRAINT "TriageRule_subjectId_key" UNIQUE ("subjectId");

-- Add foreign key from TriageRule.subjectId to TicketSubject with cascade delete
ALTER TABLE "TriageRule" ADD CONSTRAINT "TriageRule_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "TicketSubject" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update existing foreign key for parentId to include cascade delete
-- First drop the existing constraint
ALTER TABLE "TriageRule" DROP CONSTRAINT "TriageRule_parentId_fkey";

-- Then recreate it with cascade delete
ALTER TABLE "TriageRule" ADD CONSTRAINT "TriageRule_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TriageRule" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update TicketSubject.isActive to have a default value
ALTER TABLE "TicketSubject" ALTER COLUMN "isActive" SET DEFAULT true;
