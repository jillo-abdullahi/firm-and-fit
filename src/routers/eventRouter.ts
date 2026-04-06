import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { requireAdmin } from '../plugins/auth';
import { prisma } from '../db/prisma';

export const eventRouter: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get('/', {
    schema: {
      tags: ['Events'],
      summary: 'List events',
      response: {
        200: z.array(z.object({
          id: z.string(),
          title: z.string(),
          date: z.string(),
          contributionAmount: z.number()
        }))
      }
    }
  }, async () => {
    const events = await prisma.event.findMany({ orderBy: { date: 'asc' } });
    return events.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date.toISOString(),
      contributionAmount: e.contributionAmount
    }));
  });

  fastify.post('/', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Events'],
      summary: 'Create an event',
      body: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.string(),
        contributionAmount: z.number()
      }),
      response: {
        200: z.object({
          id: z.string(),
          title: z.string()
        })
      }
    }
  }, async (request) => {
    const event = await prisma.event.create({
      data: {
        title: request.body.title,
        description: request.body.description,
        contributionAmount: request.body.contributionAmount,
        date: new Date(request.body.date)
      }
    });
    return { id: event.id, title: event.title };
  });
};
