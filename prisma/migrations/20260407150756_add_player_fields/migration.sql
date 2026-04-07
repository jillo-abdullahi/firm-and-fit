-- CreateEnum
CREATE TYPE "Position" AS ENUM ('GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF');

-- AlterEnum
ALTER TYPE "RoleType" ADD VALUE 'VIEWER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "jerseyNumber" INTEGER,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "position" "Position",
ALTER COLUMN "role" SET DEFAULT 'VIEWER';
