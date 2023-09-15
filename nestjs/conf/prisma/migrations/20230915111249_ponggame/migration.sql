-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ChannelInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ChannelVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ChannelMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "ChannelMemberStatus" AS ENUM ('NORMAL', 'MUTED', 'BANNED');

-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('LADDER', 'CUSTOM');

-- CreateEnum
CREATE TYPE "MatchState" AS ENUM ('CREATED', 'INVITED', 'ACCEPTED', 'STARTED', 'DISCONNECTLEFT', 'DISCONNECTRIGHT', 'WINNERLEFT', 'WINNERRIGHT');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "avatarId" TEXT,
    "ladderLevel" INTEGER NOT NULL DEFAULT 1000,
    "enabled2FA" BOOLEAN NOT NULL DEFAULT false,
    "secret2FA" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectedUser" (
    "id" SERIAL NOT NULL,
    "socketId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ConnectedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectMessage" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelMessage" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,

    CONSTRAINT "ChannelMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelMessageReadStatus" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "readerId" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL,

    CONSTRAINT "ChannelMessageReadStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelInvitation" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "inviteeId" INTEGER NOT NULL,
    "inviterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ChannelInvitationStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "ChannelInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "visibility" "ChannelVisibility" NOT NULL DEFAULT 'PUBLIC',
    "protected" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelMember" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "channelId" INTEGER NOT NULL,
    "role" "ChannelMemberRole" NOT NULL,
    "roleSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ChannelMemberStatus" NOT NULL DEFAULT 'NORMAL',
    "statusSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "unmuteAt" TIMESTAMP(3),

    CONSTRAINT "ChannelMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "leftUserId" INTEGER NOT NULL,
    "rightUserId" INTEGER,
    "type" "MatchType" NOT NULL,
    "state" "MatchState" NOT NULL DEFAULT 'CREATED',
    "goalsLeftPlayer" INTEGER NOT NULL DEFAULT 0,
    "goalsRightPlayer" INTEGER NOT NULL DEFAULT 0,
    "goalsToWin" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Powerup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Powerup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchPowerup" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "powerupId" INTEGER NOT NULL,

    CONSTRAINT "MatchPowerup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedUser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "targetUserId" INTEGER NOT NULL,
    "blockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matchmaking" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "opponentUserId" INTEGER,
    "userReady" BOOLEAN NOT NULL DEFAULT false,
    "opponentReady" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Matchmaking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedUser_socketId_key" ON "ConnectedUser"("socketId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedUser_userId_key" ON "ConnectedUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_senderId_receiverId_key" ON "Friendship"("senderId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "DirectMessage_messageId_key" ON "DirectMessage"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelMessage_messageId_key" ON "ChannelMessage"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelMessage_messageId_senderId_key" ON "ChannelMessage"("messageId", "senderId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelInvitation_channelId_inviteeId_key" ON "ChannelInvitation"("channelId", "inviteeId");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_name_key" ON "Channel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelMember_userId_channelId_key" ON "ChannelMember"("userId", "channelId");

-- CreateIndex
CREATE UNIQUE INDEX "Powerup_name_key" ON "Powerup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MatchPowerup_matchId_powerupId_key" ON "MatchPowerup"("matchId", "powerupId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedUser_userId_targetUserId_key" ON "BlockedUser"("userId", "targetUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Matchmaking_userId_key" ON "Matchmaking"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Matchmaking_opponentUserId_key" ON "Matchmaking"("opponentUserId");

-- AddForeignKey
ALTER TABLE "ConnectedUser" ADD CONSTRAINT "ConnectedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessage" ADD CONSTRAINT "ChannelMessage_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessage" ADD CONSTRAINT "ChannelMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "ChannelMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessageReadStatus" ADD CONSTRAINT "ChannelMessageReadStatus_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChannelMessage"("messageId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMessageReadStatus" ADD CONSTRAINT "ChannelMessageReadStatus_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "ChannelMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelInvitation" ADD CONSTRAINT "ChannelInvitation_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelInvitation" ADD CONSTRAINT "ChannelInvitation_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelInvitation" ADD CONSTRAINT "ChannelInvitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMember" ADD CONSTRAINT "ChannelMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMember" ADD CONSTRAINT "ChannelMember_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_leftUserId_fkey" FOREIGN KEY ("leftUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_rightUserId_fkey" FOREIGN KEY ("rightUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPowerup" ADD CONSTRAINT "MatchPowerup_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPowerup" ADD CONSTRAINT "MatchPowerup_powerupId_fkey" FOREIGN KEY ("powerupId") REFERENCES "Powerup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedUser" ADD CONSTRAINT "BlockedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedUser" ADD CONSTRAINT "BlockedUser_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matchmaking" ADD CONSTRAINT "Matchmaking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matchmaking" ADD CONSTRAINT "Matchmaking_opponentUserId_fkey" FOREIGN KEY ("opponentUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
