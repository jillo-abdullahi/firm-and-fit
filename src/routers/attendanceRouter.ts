import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { requireAuth, requireTeamMember } from '../plugins/auth';
import { prisma } from '../db/prisma';

export const attendanceRouter: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post('/', {
    preHandler: [requireTeamMember],
    schema: {
      tags: ['Attendance'],
      summary: 'Upsert attendance',
      body: z.object({
        fixtureId: z.string(),
        status: z.enum(['GOING', 'NOT_GOING', 'MAYBE'])
      }),
      response: {
        200: z.object({
          id: z.string(),
          status: z.string()
        })
      }
    }
  }, async (request) => {
    const attendance = await prisma.attendance.upsert({
      where: {
        userId_fixtureId: {
          userId: request.user!.id,
          fixtureId: request.body.fixtureId,
        }
      },
      update: { status: request.body.status },
      create: {
        userId: request.user!.id,
        fixtureId: request.body.fixtureId,
        status: request.body.status,
      }
    });
    return { id: attendance.id, status: attendance.status };
  });

  fastify.get('/:fixtureId', {
    preHandler: [requireAuth],
    schema: {
      tags: ['Attendance'],
      summary: 'Get fixture attendance map',
      params: z.object({ fixtureId: z.string() }),
      response: {
        200: z.array(z.object({
          userId: z.string(),
          name: z.string(),
          status: z.string()
        }))
      }
    }
  }, async (request) => {
    const attendances = await prisma.attendance.findMany({
      where: { fixtureId: request.params.fixtureId },
      include: { user: true }
    });
    return attendances.map(a => ({
      userId: a.userId,
      name: a.user.name,
      status: a.status
    }));
  });
};
