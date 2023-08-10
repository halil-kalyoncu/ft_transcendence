/*
  Warnings:

  - You are about to drop the column `password` on the `Channel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "password",
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "protected" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ChannelMessageReadStatus" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "readerId" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL,

    CONSTRAINT "ChannelMessageReadStatus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChannelMessageReadStatus" ADD CONSTRAINT "ChannelMessageReadStatus_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChannelMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessageReadStatus" ADD CONSTRAINT "ChannelMessageReadStatus_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "ChannelMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
