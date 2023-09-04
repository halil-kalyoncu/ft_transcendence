-- DropForeignKey
ALTER TABLE "ChannelMessageReadStatus" DROP CONSTRAINT "ChannelMessageReadStatus_readerId_fkey";

-- AddForeignKey
ALTER TABLE "ChannelMessageReadStatus" ADD CONSTRAINT "ChannelMessageReadStatus_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "ChannelMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
