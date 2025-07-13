-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "twilioPhoneNumber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "twilioAuthToken" TEXT NOT NULL,
    "twilioAccountSid" TEXT NOT NULL,
    "twilioPhoneNumber" TEXT NOT NULL,
    "isPrimary" BOOLEAN DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "twilioPhoneNumber_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "twilioPhoneNumber_twilioPhoneNumber_key" ON "twilioPhoneNumber"("twilioPhoneNumber");
