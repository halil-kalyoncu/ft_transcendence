-- AlterTable
ALTER TABLE "DirectMessage" ADD COLUMN     "readFlag" INTEGER;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_readFlag_fkey" FOREIGN KEY ("readFlag") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
