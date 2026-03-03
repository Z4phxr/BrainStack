-- AlterTable
ALTER TABLE "task_progress" ADD COLUMN     "difficultyRating" INTEGER,
ADD COLUMN     "taskTags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "task_progress_isCorrect_idx" ON "task_progress"("isCorrect");

-- CreateIndex
CREATE INDEX "task_progress_difficultyRating_idx" ON "task_progress"("difficultyRating");
