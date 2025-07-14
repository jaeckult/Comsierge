-- CreateTable
CREATE TABLE "ScheduledMessage" (
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
    CONSTRAINT "ScheduledMessage_twilioPhoneNumberId_fkey" FOREIGN KEY ("twilioPhoneNumberId") REFERENCES "twilioPhoneNumber" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
