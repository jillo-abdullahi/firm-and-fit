-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "fixtureId" TEXT NOT NULL,
    "scorerId" TEXT NOT NULL,
    "assistId" TEXT,
    "minute" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "Fixture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_scorerId_fkey" FOREIGN KEY ("scorerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_assistId_fkey" FOREIGN KEY ("assistId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
