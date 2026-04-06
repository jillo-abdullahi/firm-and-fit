import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { requireAdmin } from '../plugins/auth';
import { prisma } from '../db/prisma';

const OpponentResponse = z.object({
  id: z.string(),
  name: z.string(),
  badgeUrl: z.string().nullable()
});

export const opponentRouter: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get('/', {
    schema: {
      tags: ['Opponents'],
      summary: 'List opponents',
      response: {
        200: z.array(OpponentResponse)
      }
    }
  }, async () => {
    return await prisma.opponent.findMany();
  });

  fastify.get('/:id', {
    schema: {
      tags: ['Opponents'],
      summary: 'Get opponent by id',
      params: z.object({ id: z.string() }),
      response: {
        200: OpponentResponse,
        404: z.object({ error: z.string() })
      }
    }
  }, async (request, reply) => {
    const opp = await prisma.opponent.findUnique({ where: { id: request.params.id } });
    if (!opp) {
      reply.status(404).send({ error: 'Opponent not found' });
      return;
    }
    return opp;
  });

  fastify.post('/', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Opponents'],
      summary: 'Create opponent',
      body: z.object({ name: z.string(), badgeUrl: z.string().optional() }),
      response: {
        200: z.object({ id: z.string(), name: z.string() })
      }
    }
  }, async (request) => {
    return await prisma.opponent.create({
      data: request.body
    });
  });

  fastify.patch('/:id', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Opponents'],
      summary: 'Update opponent',
      params: z.object({ id: z.string() }),
      body: z.object({ name: z.string().optional(), badgeUrl: z.string().optional() }),
      response: {
        200: z.object({ id: z.string(), name: z.string() })
      }
    }
  }, async (request) => {
    return await prisma.opponent.update({
      where: { id: request.params.id },
      data: { name: request.body.name, badgeUrl: request.body.badgeUrl }
    });
  });

  fastify.get('/:id/stats', {
    schema: {
      tags: ['Opponents'],
      summary: 'Get stats vs opponent',
      params: z.object({ id: z.string() }),
      response: {
        200: z.object({
          totalMatches: z.number(),
          wins: z.number(),
          losses: z.number(),
          draws: z.number(),
          goalsFor: z.number(),
          goalsAgainst: z.number()
        })
      }
    }
  }, async (request) => {
    const fixtures = await prisma.fixture.findMany({
      where: { opponentId: request.params.id }
    });
    
    let wins = 0, losses = 0, draws = 0, goalsFor = 0, goalsAgainst = 0;
    
    for (const f of fixtures) {
      if (f.homeScore !== null && f.awayScore !== null) {
        const us = f.isHome ? f.homeScore : f.awayScore;
        const them = f.isHome ? f.awayScore : f.homeScore;
        
        goalsFor += us;
        goalsAgainst += them;
        if (us > them) wins++;
        else if (them > us) losses++;
        else draws++;
      }
    }
    
    return { totalMatches: fixtures.length, wins, losses, draws, goalsFor, goalsAgainst };
  });
};
