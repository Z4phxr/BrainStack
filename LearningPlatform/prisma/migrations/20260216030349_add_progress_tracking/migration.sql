-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('NOT_ATTEMPTED', 'ATTEMPTED', 'PASSED');

-- CreateTable
CREATE TABLE "lesson_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" "LessonStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "lessonProgressId" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'NOT_ATTEMPTED',
    "submittedAnswer" TEXT,
    "earnedPoints" INTEGER NOT NULL DEFAULT 0,
    "maxPoints" INTEGER NOT NULL,
    "isCorrect" BOOLEAN,
    "attemptedAt" TIMESTAMP(3),
    "passedAt" TIMESTAMP(3),

    CONSTRAINT "task_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "totalLessons" INTEGER NOT NULL DEFAULT 0,
    "completedLessons" INTEGER NOT NULL DEFAULT 0,
    "progressPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "earnedPoints" INTEGER NOT NULL DEFAULT 0,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lesson_progress_userId_idx" ON "lesson_progress"("userId");

-- CreateIndex
CREATE INDEX "lesson_progress_lessonId_idx" ON "lesson_progress"("lessonId");

-- CreateIndex
CREATE INDEX "lesson_progress_status_idx" ON "lesson_progress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_userId_lessonId_key" ON "lesson_progress"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "task_progress_userId_idx" ON "task_progress"("userId");

-- CreateIndex
CREATE INDEX "task_progress_taskId_idx" ON "task_progress"("taskId");

-- CreateIndex
CREATE INDEX "task_progress_status_idx" ON "task_progress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "task_progress_userId_taskId_key" ON "task_progress"("userId", "taskId");

-- CreateIndex
CREATE INDEX "course_progress_userId_idx" ON "course_progress"("userId");

-- CreateIndex
CREATE INDEX "course_progress_courseId_idx" ON "course_progress"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "course_progress_userId_courseId_key" ON "course_progress"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_progress" ADD CONSTRAINT "task_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_progress" ADD CONSTRAINT "task_progress_lessonProgressId_fkey" FOREIGN KEY ("lessonProgressId") REFERENCES "lesson_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
