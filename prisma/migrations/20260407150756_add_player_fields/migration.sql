-- CreateEnum
CREATE TYPE "Position" AS ENUM ('GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF');

-- AlterEnum: ADD VALUE must be committed before use — done in separate migration
ALTER TYPE "RoleType" ADD VALUE IF NOT EXISTS 'VIEWER';
