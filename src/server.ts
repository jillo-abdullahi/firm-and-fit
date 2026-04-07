import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { serializerCompiler, validatorCompiler, jsonSchemaTransform, ZodTypeProvider } from 'fastify-type-provider-zod';

import { authPlugin } from './plugins/auth';

// Refactored Routers will go here
import { authRouter } from './routers/authRouter';
import { userRouter } from './routers/userRouter';
import { competitionRouter } from './routers/competitionRouter';
import { opponentRouter } from './routers/opponentRouter';
import { fixtureRouter } from './routers/fixtureRouter';
import { attendanceRouter } from './routers/attendanceRouter';
import { eventRouter } from './routers/eventRouter';
import { paymentRouter } from './routers/paymentRouter';
import { voteRouter } from './routers/voteRouter';
import { cardRouter } from './routers/cardRouter';

export const buildApp = async () => {
  const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

  // Add schema validators for Zod
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(cors);
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '15 minutes'
  });

  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Football Team Management API',
        description: 'Fastify + Zod + Prisma Backend',
        version: '1.0.0'
      },
    },
    transform: jsonSchemaTransform,
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs'
  });

  // Context Population
  await app.register(authPlugin);

  // System endpoints
  app.get('/api/health', {
    schema: {
      tags: ['System'],
      summary: 'Health check'
    }
  }, async () => ({ status: 'ok' }));

  // App endpoints
  await app.register(authRouter, { prefix: '/api/auth' });
  await app.register(userRouter, { prefix: '/api/users' });
  await app.register(competitionRouter, { prefix: '/api/competitions' });
  await app.register(opponentRouter, { prefix: '/api/opponents' });
  await app.register(fixtureRouter, { prefix: '/api/fixtures' });
  await app.register(attendanceRouter, { prefix: '/api/attendance' });
  await app.register(eventRouter, { prefix: '/api/events' });
  await app.register(paymentRouter, { prefix: '/api/payments' });
  await app.register(voteRouter, { prefix: '/api/votes' });
  await app.register(cardRouter, { prefix: '/api/cards' });

  return app;
};

// Start the server
if (require.main === module) {
  buildApp().then(app => {
    app.listen({ port: parseInt(process.env.PORT || '3000'), host: '0.0.0.0' }, (err) => {
      if (err) {
        app.log.error(err);
        process.exit(1);
      }
    });
  });
}
