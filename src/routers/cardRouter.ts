import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { requireAdmin } from '../plugins/auth';
import { prisma } from '../db/prisma';

const CardResponse = z.object({
  id: z.string(),
  userId: z.string(),
  fixtureId: z.string(),
  type: z.enum(['YELLOW', 'RED']),
  createdAt: z.string()
});

export const cardRouter: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post('/', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Cards'],
      summary: 'Issue a card to a player (Admin only)',
      body: z.object({
        userId: z.string(),
        fixtureId: z.string(),
        type: z.enum(['YELLOW', 'RED'])
      }),
      response: {
        200: CardResponse
      }
    }
  }, async (request) => {
    const card = await prisma.card.create({ data: request.body });
    return { ...card, createdAt: card.createdAt.toISOString() };
  });

  fastify.get('/fixture/:fixtureId', {
    schema: {
      tags: ['Cards'],
      summary: 'Get all cards for a fixture',
      params: z.object({ fixtureId: z.string() }),
      response: {
        200: z.array(CardResponse)
      }
    }
  }, async (request) => {
    const cards = await prisma.card.findMany({
      where: { fixtureId: request.params.fixtureId },
      orderBy: { createdAt: 'asc' }
    });
    return cards.map(c => ({ ...c, createdAt: c.createdAt.toISOString() }));
  });

  fastify.get('/player/:userId', {
    schema: {
      tags: ['Cards'],
      summary: 'Get all cards for a player',
      params: z.object({ userId: z.string() }),
      response: {
        200: z.array(CardResponse)
      }
    }
  }, async (request) => {
    const cards = await prisma.card.findMany({
      where: { userId: request.params.userId },
      orderBy: { createdAt: 'desc' }
    });
    return cards.map(c => ({ ...c, createdAt: c.createdAt.toISOString() }));
  });

  fastify.delete('/:id', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Cards'],
      summary: 'Delete a card (Admin only)',
      params: z.object({ id: z.string() }),
      response: {
        200: z.object({ success: z.boolean() })
      }
    }
  }, async (request) => {
    await prisma.card.delete({ where: { id: request.params.id } });
    return { success: true };
  });
};
