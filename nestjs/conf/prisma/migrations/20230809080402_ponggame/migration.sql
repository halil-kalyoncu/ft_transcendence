/*
  Warnings:

  - You are about to drop the column `readFlag` on the `DirectMessage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DirectMessage" DROP CONSTRAINT "DirectMessage_readFlag_fkey";

-- AlterTable
ALTER TABLE "DirectMessage" DROP COLUMN "readFlag",
ADD COLUMN     "messageReceived" BOOLEAN NOT NULL DEFAULT false;
