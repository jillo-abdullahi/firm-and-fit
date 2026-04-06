import fp from 'fastify-plugin';
import { auth } from '../utils/firebase';
import { prisma } from '../db/prisma';
import { User, RoleType } from '@prisma/client';
import { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user: User | null;
  }
}

export const authPlugin = fp(async (fastify, opts) => {
  fastify.decorateRequest('user', null);

  fastify.addHook('onRequest', async (request, reply) => {
    const authorization = request.headers.authorization;
    const token = authorization?.startsWith('Bearer ') ? authorization.split(' ')[1] : authorization;

    let user: User | null = null;
    if (token && auth) {
      try {
        const decodedUser = await auth.verifyIdToken(token);
        user = await prisma.user.findUnique({
          where: { firebaseUid: decodedUser.uid },
        });
        if (!user) {
          user = await prisma.user.create({
            data: {
              firebaseUid: decodedUser.uid,
              email: decodedUser.email || '',
              name: decodedUser.name || 'Unknown',
              role: 'PLAYER',
            },
          });
        }
      } catch (e) {
        request.log.warn({ error: e }, 'Error verifying firebase token');
      }
    }
    request.user = user;
  });
});

export const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.user) {
    reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Not authenticated' });
    return reply;
  }
};

export const requireAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
  if (!request.user) {
    reply.status(401).send({ error: 'UNAUTHORIZED', message: 'Not authenticated' });
    return reply;
  }
  if (request.user.role !== 'ADMIN') {
    reply.status(403).send({ error: 'FORBIDDEN', message: 'Admin access required' });
    return reply;
  }
};
