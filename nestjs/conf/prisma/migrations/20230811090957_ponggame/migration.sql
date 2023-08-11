-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('LADDER', 'CUSTOM');

-- CreateEnum
CREATE TYPE "MatchState" AS ENUM ('CREATED', 'INVITED', 'ACCEPTED', 'STARTED', 'DISCONNECTLEFT', 'DISCONNECTRIGHT', 'WINNERLEFT', 'WINNERRIGHT');

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "leftUserId" INTEGER NOT NULL,
    "rightUserId" INTEGER,
    "type" "MatchType" NOT NULL,
    "state" "MatchState" NOT NULL DEFAULT 'CREATED',
    "goalsLeftPlayer" INTEGER NOT NULL DEFAULT 0,
    "goalsRightPlayer" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_leftUserId_fkey" FOREIGN KEY ("leftUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_rightUserId_fkey" FOREIGN KEY ("rightUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
