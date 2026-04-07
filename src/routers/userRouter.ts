import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { requireAdmin, requireAuth, requireTeamMember } from '../plugins/auth';
import { prisma } from '../db/prisma';

const getGeneralPosition = (pos: string | null) => {
  if (!pos) return null;
  if (['GK'].includes(pos)) return 'GOALKEEPER';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return 'DEFENDER';
  if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(pos)) return 'MIDFIELDER';
  if (['LW', 'RW', 'ST', 'CF'].includes(pos)) return 'ATTACKER';
  return null;
};

export const userRouter: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get('/public', {
    schema: {
      tags: ['Users'],
      summary: 'List all players publicly with stats',
      response: {
        200: z.array(z.object({
          id: z.string(),
          name: z.string(),
          photoUrl: z.string().nullable(),
          position: z.string().nullable(),
          generalPosition: z.string().nullable(),
          jerseyNumber: z.number().nullable(),
          stats: z.object({
            goals: z.number(),
            assists: z.number(),
            attendances: z.number(),
            yellowCards: z.number(),
            redCards: z.number()
          })
        }))
      }
    }
  }, async () => {
    const players = await prisma.user.findMany({
      where: { role: 'PLAYER' },
      include: {
        _count: {
          select: {
            goalsScored: true,
            goalsAssisted: true,
            attendances: { where: { status: 'GOING' } },
            cards: true
          }
        },
        cards: { select: { type: true } }
      }
    });

    return players.map(u => ({
      id: u.id,
      name: u.name,
      photoUrl: u.photoUrl,
      position: u.position,
      generalPosition: getGeneralPosition(u.position),
      jerseyNumber: u.jerseyNumber,
      stats: {
        goals: u._count.goalsScored,
        assists: u._count.goalsAssisted,
        attendances: u._count.attendances,
        yellowCards: u.cards.filter(c => c.type === 'YELLOW').length,
        redCards: u.cards.filter(c => c.type === 'RED').length
      }
    }));
  });

  fastify.patch('/:id/profile', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Users'],
      summary: 'Update player profile (Admin only)',
      params: z.object({ id: z.string() }),
      body: z.object({
        photoUrl: z.string().nullable().optional(),
        jerseyNumber: z.number().nullable().optional(),
        position: z.enum(['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF']).nullable().optional(),
      }),
      response: {
        200: z.object({ success: z.boolean() })
      }
    }
  }, async (request) => {
    await prisma.user.update({
      where: { id: request.params.id },
      data: request.body
    });
    return { success: true };
  });

  fastify.get('/', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Users'],
      summary: 'List all users',
      response: {
        200: z.array(z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
          role: z.enum(['ADMIN', 'PLAYER', 'VIEWER']),
          yellowCards: z.number(),
          redCards: z.number()
        }))
      }
    }
  }, async () => {
    const users = await prisma.user.findMany({
      include: {
        cards: { select: { type: true } }
      }
    });
    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      yellowCards: u.cards.filter(c => c.type === 'YELLOW').length,
      redCards: u.cards.filter(c => c.type === 'RED').length
    }));
  });

  fastify.patch('/:id/role', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Users'],
      summary: 'Update user role',
      params: z.object({ id: z.string() }),
      body: z.object({ role: z.enum(['ADMIN', 'PLAYER', 'VIEWER']) }),
      response: {
        200: z.object({ success: z.boolean() })
      }
    }
  }, async (request) => {
    await prisma.user.update({
      where: { id: request.params.id },
      data: { role: request.body.role }
    });
    return { success: true };
  });
};
