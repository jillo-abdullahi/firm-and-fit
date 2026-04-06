import { prisma } from '../src/db/prisma';
import { buildApp } from '../src/server';

let app: any;

beforeAll(async () => {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('test')) {
    console.warn("WARNING: DATABASE_URL does not seem to point to a test database!");
  }
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  if (app) await app.close();
  await prisma.$disconnect();
});

export const getApp = () => app;
