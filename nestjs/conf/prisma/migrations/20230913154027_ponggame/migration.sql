/*
  Warnings:

  - A unique constraint covering the columns `[messageId,readerId]` on the table `ChannelMessageReadStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ChannelMessage" DROP CONSTRAINT "ChannelMessage_messageId_fkey";

-- DropForeignKey
ALTER TABLE "ChannelMessageReadStatus" DROP CONSTRAINT "ChannelMessageReadStatus_messageId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "ChannelMessageReadStatus_messageId_readerId_key" ON "ChannelMessageReadStatus"("messageId", "readerId");

-- AddForeignKey
ALTER TABLE "ChannelMessage" ADD CONSTRAINT "ChannelMessage_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessageReadStatus" ADD CONSTRAINT "ChannelMessageReadStatus_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChannelMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
