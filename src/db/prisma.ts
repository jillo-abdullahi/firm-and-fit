import { PrismaClient } from '@prisma/client';

let prismaClient: PrismaClient;
try {
  prismaClient = new PrismaClient({} as any);
} catch (e) {
  prismaClient = { $disconnect: async () => {} } as PrismaClient;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClient;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
