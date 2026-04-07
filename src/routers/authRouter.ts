import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { requireAuth } from '../plugins/auth';

export const authRouter: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get('/me', {
    preHandler: [requireAuth],
    schema: {
      tags: ['Auth'],
      summary: 'Get current user data',
      response: {
        200: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
          role: z.enum(['ADMIN', 'PLAYER', 'VIEWER'])
        })
      }
    }
  }, async (request) => {
    return {
      id: request.user!.id,
      name: request.user!.name,
      email: request.user!.email,
      role: request.user!.role,
    };
  });
};
