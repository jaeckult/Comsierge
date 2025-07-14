-- CreateTable
CREATE TABLE "Message" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_twilioPhoneNumberId_fkey" FOREIGN KEY ("twilioPhoneNumberId") REFERENCES "twilioPhoneNumber" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Message_messageSid_key" ON "Message"("messageSid");
