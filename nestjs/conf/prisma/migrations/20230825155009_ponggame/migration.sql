-- DropForeignKey
ALTER TABLE "ChannelMessage" DROP CONSTRAINT "ChannelMessage_senderId_fkey";

-- AddForeignKey
ALTER TABLE "ChannelMessage" ADD CONSTRAINT "ChannelMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "ChannelMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
