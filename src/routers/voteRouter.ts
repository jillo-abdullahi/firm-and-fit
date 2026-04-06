import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { requireAuth } from '../plugins/auth';
import { prisma } from '../db/prisma';

export const voteRouter: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post('/', {
    preHandler: [requireAuth],
    schema: {
      tags: ['Votes'],
      summary: 'Vote Man of the Match',
      body: z.object({
        fixtureId: z.string(),
        votedForId: z.string()
      }),
      response: {
        200: z.object({ success: z.boolean() }),
        409: z.object({ error: z.string() })
      }
    }
  }, async (request, reply) => {
    const existingVote = await prisma.vote.findUnique({
      where: {
        fixtureId_voterId: {
          fixtureId: request.body.fixtureId,
          voterId: request.user!.id,
        }
      }
    });

    if (existingVote) {
      reply.status(409).send({ error: 'You have already voted for this fixture' });
      return;
    }

    await prisma.vote.create({
      data: {
        fixtureId: request.body.fixtureId,
        voterId: request.user!.id,
        votedForId: request.body.votedForId
      }
    });
    return { success: true };
  });

  fastify.get('/:fixtureId', {
    preHandler: [requireAuth],
    schema: {
      tags: ['Votes'],
      summary: 'Get votes per player',
      params: z.object({ fixtureId: z.string() }),
      response: {
        200: z.array(z.object({
          userId: z.string(),
          name: z.string(),
          voteCount: z.number()
        }))
      }
    }
  }, async (request) => {
    const votes = await prisma.vote.groupBy({
      by: ['votedForId'],
      where: { fixtureId: request.params.fixtureId },
      _count: { votedForId: true }
    });
    
    const userIds = votes.map(v => v.votedForId);
    const users = await prisma.user.findMany({ where: { id: { in: userIds } } });
    
    return votes.map(v => {
      const user = users.find(u => u.id === v.votedForId);
      return {
        userId: v.votedForId,
        name: user?.name || 'Unknown',
        voteCount: v._count.votedForId
      };
    }).sort((a, b) => b.voteCount - a.voteCount);
  });
};
