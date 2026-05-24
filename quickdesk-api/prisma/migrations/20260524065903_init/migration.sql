/*
  Warnings:

  - You are about to drop the column `legacyRole` on the `User` table. All the data in the column will be lost.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "screenshots" TEXT[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "legacyRole",
ADD COLUMN     "hashedRefreshToken" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "LegacyRole";

-- CreateTable
CREATE TABLE "KnowledgeChunk" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "embedding" vector(384),

    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);
