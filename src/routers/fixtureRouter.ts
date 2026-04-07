import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { requireAdmin } from '../plugins/auth';
import { prisma } from '../db/prisma';

const FixtureResponse = z.object({
  id: z.string(),
  opponentId: z.string(),
  homeScore: z.number().nullable(),
  awayScore: z.number().nullable(),
  isHome: z.boolean(),
  date: z.string(),
  location: z.string(),
  type: z.enum(['LEAGUE', 'FRIENDLY']),
  competitionId: z.string().nullable(),
  rsvpDeadline: z.string().nullable()
});

export const fixtureRouter: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get('/', {
    schema: {
      tags: ['Fixtures'],
      summary: 'List fixtures',
      querystring: z.object({ type: z.enum(['upcoming', 'past']).optional() }),
      response: {
        200: z.array(FixtureResponse)
      }
    }
  }, async (request) => {
    let where = {};
    if (request.query.type === 'upcoming') {
      where = { date: { gte: new Date() } };
    } else if (request.query.type === 'past') {
      where = { date: { lt: new Date() } };
    }
    
    const results = await prisma.fixture.findMany({ where, orderBy: { date: 'asc' } });
    return results.map(r => ({
      ...r,
      date: r.date.toISOString(),
      rsvpDeadline: r.rsvpDeadline?.toISOString() || null
    }));
  });

  fastify.get('/:id', {
    schema: {
      tags: ['Fixtures'],
      summary: 'Get fixture details',
      params: z.object({ id: z.string() }),
      response: {
        200: FixtureResponse,
        404: z.object({ error: z.string() })
      }
    }
  }, async (request, reply) => {
    const result = await prisma.fixture.findUnique({ where: { id: request.params.id } });
    if (!result) {
      reply.status(404).send({ error: 'Fixture not found' });
      return;
    }
    return {
      ...result,
      date: result.date.toISOString(),
      rsvpDeadline: result.rsvpDeadline?.toISOString() || null
    };
  });

  fastify.post('/', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Fixtures'],
      summary: 'Create fixture',
      body: z.object({
        opponentId: z.string(),
        isHome: z.boolean(),
        date: z.string(), // ISO string
        location: z.string(),
        type: z.enum(['LEAGUE', 'FRIENDLY']),
        competitionId: z.string().optional(),
        rsvpDeadline: z.string().optional()
      }),
      response: {
        200: FixtureResponse
      }
    }
  }, async (request) => {
    const result = await prisma.fixture.create({
      data: {
        ...request.body,
        date: new Date(request.body.date),
        rsvpDeadline: request.body.rsvpDeadline ? new Date(request.body.rsvpDeadline) : undefined
      }
    });
    return {
      ...result,
      date: result.date.toISOString(),
      rsvpDeadline: result.rsvpDeadline?.toISOString() || null
    };
  });

  fastify.patch('/:id', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Fixtures'],
      summary: 'Update fixture score',
      params: z.object({ id: z.string() }),
      body: z.object({
        homeScore: z.number().optional(),
        awayScore: z.number().optional()
      }),
      response: {
        200: FixtureResponse
      }
    }
  }, async (request) => {
    const result = await prisma.fixture.update({
      where: { id: request.params.id },
      data: {
        homeScore: request.body.homeScore,
        awayScore: request.body.awayScore
      }
    });
    return {
      ...result,
      date: result.date.toISOString(),
      rsvpDeadline: result.rsvpDeadline?.toISOString() || null
    };
  });

  fastify.delete('/:id', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Fixtures'],
      summary: 'Delete fixture',
      params: z.object({ id: z.string() }),
      response: {
        200: z.object({ success: z.boolean() })
      }
    }
  }, async (request) => {
    await prisma.fixture.delete({ where: { id: request.params.id } });
    return { success: true };
  });

  fastify.post('/:id/goals', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Fixtures'],
      summary: 'Add a goal',
      params: z.object({ id: z.string() }),
      body: z.object({
        scorerId: z.string(),
        assistId: z.string().optional(),
        minute: z.number().optional()
      }),
      response: {
        200: z.object({
          id: z.string(),
          scorerId: z.string(),
          assistId: z.string().nullable(),
          minute: z.number().nullable()
        })
      }
    }
  }, async (request) => {
    return await prisma.goal.create({
      data: {
        fixtureId: request.params.id,
        scorerId: request.body.scorerId,
        assistId: request.body.assistId,
        minute: request.body.minute
      }
    });
  });

  fastify.get('/:id/goals', {
    schema: {
      tags: ['Fixtures'],
      summary: 'List goals for a fixture',
      params: z.object({ id: z.string() }),
      response: {
        200: z.array(z.object({
          id: z.string(),
          scorerId: z.string(),
          scorerName: z.string(),
          assistId: z.string().nullable(),
          assistName: z.string().nullable(),
          minute: z.number().nullable()
        }))
      }
    }
  }, async (request) => {
    const goals = await prisma.goal.findMany({
      where: { fixtureId: request.params.id },
      include: {
        scorer: true,
        assist: true
      },
      orderBy: {
        minute: 'asc'
      }
    });

    return goals.map((g) => ({
      id: g.id,
      scorerId: g.scorerId,
      scorerName: g.scorer.name,
      assistId: g.assistId,
      assistName: g.assist?.name || null,
      minute: g.minute
    }));
  });

  fastify.delete('/:id/goals/:goalId', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Fixtures'],
      summary: 'Delete a goal',
      params: z.object({ id: z.string(), goalId: z.string() }),
      response: {
        200: z.object({ success: z.boolean() })
      }
    }
  }, async (request) => {
    await prisma.goal.delete({ where: { id: request.params.goalId } });
    return { success: true };
  });
};
