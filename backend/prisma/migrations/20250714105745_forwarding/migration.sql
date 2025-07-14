/*
  Warnings:

  - You are about to drop the `twilioPhoneNumber` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "twilioPhoneNumber_twilioPhoneNumber_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "twilioPhoneNumber";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "TwilioPhoneNumber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "twilioAuthToken" TEXT NOT NULL,
    "twilioAccountSid" TEXT NOT NULL,
    "twilioPhoneNumber" TEXT NOT NULL,
    "isPrimary" BOOLEAN DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TwilioPhoneNumber_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageSid" TEXT NOT NULL,
    "accountSid" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "numMedia" INTEGER NOT NULL DEFAULT 0,
    "mediaUrl" TEXT,
    "messageStatus" TEXT NOT NULL DEFAULT 'queued',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusTimestamp" DATETIME,
    "direction" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "twilioPhoneNumberId" TEXT NOT NULL,
    "forwarded" BOOLEAN NOT NULL DEFAULT false,
    "forwardedTo" TEXT,
    "originalMessageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_twilioPhoneNumberId_fkey" FOREIGN KEY ("twilioPhoneNumberId") REFERENCES "TwilioPhoneNumber" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_originalMessageId_fkey" FOREIGN KEY ("originalMessageId") REFERENCES "Message" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("accountSid", "body", "createdAt", "direction", "errorCode", "errorMessage", "from", "id", "mediaUrl", "messageSid", "messageStatus", "numMedia", "statusTimestamp", "timestamp", "to", "twilioPhoneNumberId", "updatedAt", "userId") SELECT "accountSid", "body", "createdAt", "direction", "errorCode", "errorMessage", "from", "id", "mediaUrl", "messageSid", "messageStatus", "numMedia", "statusTimestamp", "timestamp", "to", "twilioPhoneNumberId", "updatedAt", "userId" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE UNIQUE INDEX "Message_messageSid_key" ON "Message"("messageSid");
CREATE INDEX "Message_messageSid_idx" ON "Message"("messageSid");
CREATE INDEX "Message_userId_idx" ON "Message"("userId");
CREATE INDEX "Message_twilioPhoneNumberId_idx" ON "Message"("twilioPhoneNumberId");
CREATE TABLE "new_ScheduledMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sendAt" DATETIME NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "failed" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "userId" TEXT NOT NULL,
    "twilioPhoneNumberId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScheduledMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ScheduledMessage_twilioPhoneNumberId_fkey" FOREIGN KEY ("twilioPhoneNumberId") REFERENCES "TwilioPhoneNumber" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ScheduledMessage" ("body", "createdAt", "errorMessage", "failed", "from", "id", "sendAt", "sent", "to", "twilioPhoneNumberId", "updatedAt", "userId") SELECT "body", "createdAt", "errorMessage", "failed", "from", "id", "sendAt", "sent", "to", "twilioPhoneNumberId", "updatedAt", "userId" FROM "ScheduledMessage";
DROP TABLE "ScheduledMessage";
ALTER TABLE "new_ScheduledMessage" RENAME TO "ScheduledMessage";
CREATE INDEX "ScheduledMessage_sendAt_idx" ON "ScheduledMessage"("sendAt");
CREATE INDEX "ScheduledMessage_userId_idx" ON "ScheduledMessage"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TwilioPhoneNumber_twilioPhoneNumber_key" ON "TwilioPhoneNumber"("twilioPhoneNumber");
