/*
  Warnings:

  - You are about to drop the column `messageReceived` on the `DirectMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DirectMessage" DROP COLUMN "messageReceived",
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;
