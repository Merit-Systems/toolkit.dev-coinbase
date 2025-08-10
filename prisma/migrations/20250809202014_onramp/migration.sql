-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('pending', 'started', 'succeeded', 'failed');

-- CreateTable
CREATE TABLE "OnrampSession" (
    "id" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'pending',
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txHash" TEXT,
    "failureReason" TEXT,

    CONSTRAINT "OnrampSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnrampSession_txHash_key" ON "OnrampSession"("txHash");

-- AddForeignKey
ALTER TABLE "OnrampSession" ADD CONSTRAINT "OnrampSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
