-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "position" INTEGER,
ADD COLUMN     "startTime" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'todo',
ADD COLUMN     "totalTimeSpent" INTEGER;
