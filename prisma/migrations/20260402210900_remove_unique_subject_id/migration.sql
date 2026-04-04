-- Remove unique constraint on subjectId to allow many-to-one relationship
ALTER TABLE "TriageRule" DROP CONSTRAINT "TriageRule_subjectId_key";
