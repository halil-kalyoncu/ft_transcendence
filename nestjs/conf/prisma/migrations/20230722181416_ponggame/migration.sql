/*
  Warnings:

  - You are about to drop the `_MemberChannels` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ChannelVisibility" AS ENUM ('PUBLIC', 'PROTECTED', 'PRIVATE');

-- DropForeignKey
ALTER TABLE "_MemberChannels" DROP CONSTRAINT "_MemberChannels_A_fkey";

-- DropForeignKey
ALTER TABLE "_MemberChannels" DROP CONSTRAINT "_MemberChannels_B_fkey";

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "visibility" "ChannelVisibility" NOT NULL DEFAULT 'PUBLIC';

-- DropTable
DROP TABLE "_MemberChannels";

-- CreateTable
CREATE TABLE "ChannelMember" (
    "userId" INTEGER NOT NULL,
    "channelId" INTEGER NOT NULL,
    "role" "UserRole" NOT NULL,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "unmuteAt" TIMESTAMP(3),

    CONSTRAINT "ChannelMember_pkey" PRIMARY KEY ("userId","channelId")
);

-- AddForeignKey
ALTER TABLE "ChannelMember" ADD CONSTRAINT "ChannelMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMember" ADD CONSTRAINT "ChannelMember_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
