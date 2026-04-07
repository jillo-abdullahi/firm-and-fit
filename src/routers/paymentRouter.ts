import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { requireAdmin, requireAuth, requireTeamMember } from '../plugins/auth';
import { prisma } from '../db/prisma';

export const paymentRouter: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post('/monthly', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Payments'],
      summary: 'Generate monthly payments globally',
      body: z.object({ month: z.string(), amount: z.number() }),
      response: {
        200: z.object({ generatedCount: z.number() })
      }
    }
  }, async (request) => {
    const players = await prisma.user.findMany({ where: { role: 'PLAYER' } });
    let count = 0;
    for (const player of players) {
      const exists = await prisma.payment.findFirst({
        where: { userId: player.id, type: 'MONTHLY', month: request.body.month }
      });
      if (!exists) {
        await prisma.payment.create({
          data: {
            userId: player.id,
            amount: request.body.amount,
            type: 'MONTHLY',
            month: request.body.month,
            status: 'PENDING'
          }
        });
        count++;
      }
    }
    return { generatedCount: count };
  });

  fastify.patch('/:id/pay', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Payments'],
      summary: 'Mark payment as paid',
      params: z.object({ id: z.string() }),
      response: {
        200: z.object({ success: z.boolean() })
      }
    }
  }, async (request) => {
    await prisma.payment.update({
      where: { id: request.params.id },
      data: { status: 'PAID' }
    });
    return { success: true };
  });

  fastify.get('/me', {
    preHandler: [requireTeamMember],
    schema: {
      tags: ['Payments'],
      summary: 'Get current user payments',
      response: {
        200: z.array(z.object({
          id: z.string(),
          amount: z.number(),
          type: z.string(),
          status: z.string(),
          month: z.string().nullable()
        }))
      }
    }
  }, async (request) => {
    const payments = await prisma.payment.findMany({
      where: { userId: request.user!.id },
      orderBy: { createdAt: 'desc' }
    });
    return payments.map(p => ({
      id: p.id,
      amount: p.amount,
      type: p.type,
      status: p.status,
      month: p.month
    }));
  });

  fastify.get('/summary', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Payments'],
      summary: 'Team payment overview',
      querystring: z.object({ month: z.string() }),
      response: {
        200: z.object({
          totalExpected: z.number(),
          totalCollected: z.number(),
          pendingCount: z.number()
        })
      }
    }
  }, async (request) => {
    const payments = await prisma.payment.findMany({
      where: { month: request.query.month, type: 'MONTHLY' }
    });
    
    let totalExpected = 0;
    let totalCollected = 0;
    let pendingCount = 0;
    
    payments.forEach(p => {
      totalExpected += p.amount;
      if (p.status === 'PAID') totalCollected += p.amount;
      else pendingCount++;
    });
    
    return { totalExpected, totalCollected, pendingCount };
  });
};
