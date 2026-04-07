import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const initPrisma = () => {
  const url = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;
  if (url?.startsWith('prisma+postgres://')) {
    return new PrismaClient({ accelerateUrl: url });
  } else {
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? initPrisma();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
