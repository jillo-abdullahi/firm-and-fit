-- AlterTable: runs after VIEWER enum was committed in previous migration
ALTER TABLE "User" ADD COLUMN     "jerseyNumber" INTEGER,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "position" "Position",
ALTER COLUMN "role" SET DEFAULT 'VIEWER';
