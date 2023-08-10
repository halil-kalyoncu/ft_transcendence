/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Channel` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_ownerId_fkey";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "ownerId";
