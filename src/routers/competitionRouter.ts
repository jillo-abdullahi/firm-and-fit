import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { requireAdmin } from '../plugins/auth';
import { prisma } from '../db/prisma';

const CompetitionResponse = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['LEAGUE', 'TOURNAMENT', 'FRIENDLY_SERIES', 'SISI_KWA_SISI']),
  season: z.string()
});

export const competitionRouter: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get('/', {
    schema: {
      tags: ['Competitions'],
      summary: 'Get competitions',
      response: {
        200: z.array(CompetitionResponse)
      }
    }
  }, async () => {
    return await prisma.competition.findMany();
  });

  fastify.post('/', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Competitions'],
      summary: 'Create competition',
      body: z.object({
        name: z.string(),
        type: z.enum(['LEAGUE', 'TOURNAMENT', 'FRIENDLY_SERIES', 'SISI_KWA_SISI']),
        season: z.string()
      }),
      response: {
        200: CompetitionResponse
      }
    }
  }, async (request) => {
    return await prisma.competition.create({
      data: request.body
    });
  });
};
