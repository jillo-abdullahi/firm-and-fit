import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { requireAdmin } from '../plugins/auth';
import { prisma } from '../db/prisma';

export const userRouter: FastifyPluginAsyncZod = async (fastify) => {
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
          role: z.enum(['ADMIN', 'PLAYER'])
        }))
      }
    }
  }, async () => {
    const users = await prisma.user.findMany();
    return users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
  });

  fastify.patch('/:id/role', {
    preHandler: [requireAdmin],
    schema: {
      tags: ['Users'],
      summary: 'Update user role',
      params: z.object({ id: z.string() }),
      body: z.object({ role: z.enum(['ADMIN', 'PLAYER']) }),
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
