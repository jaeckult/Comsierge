-- CreateTable
CREATE TABLE "MessageForwarding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "originalMessageId" TEXT NOT NULL,
    "forwardedMessageId" TEXT NOT NULL,
    "forwardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "MessageForwarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MessageForwarding_originalMessageId_fkey" FOREIGN KEY ("originalMessageId") REFERENCES "Message" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MessageForwarding_forwardedMessageId_fkey" FOREIGN KEY ("forwardedMessageId") REFERENCES "Message" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MessageForwarding_originalMessageId_idx" ON "MessageForwarding"("originalMessageId");

-- CreateIndex
CREATE INDEX "MessageForwarding_forwardedMessageId_idx" ON "MessageForwarding"("forwardedMessageId");

-- CreateIndex
CREATE INDEX "MessageForwarding_userId_idx" ON "MessageForwarding"("userId");
