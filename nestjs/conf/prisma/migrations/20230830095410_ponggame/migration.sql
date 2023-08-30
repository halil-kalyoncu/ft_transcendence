-- DropForeignKey
ALTER TABLE "ChannelMessageReadStatus" DROP CONSTRAINT "ChannelMessageReadStatus_readerId_fkey";

-- DropIndex
DROP INDEX "ChannelMember_userId_key";

-- AddForeignKey
ALTER TABLE "ChannelMessageReadStatus" ADD CONSTRAINT "ChannelMessageReadStatus_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "ChannelMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
