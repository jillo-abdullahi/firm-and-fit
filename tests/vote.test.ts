import { getApp } from './setup';

describe('Vote Routes', () => {
  test('POST /api/votes rejects unauthenticated', async () => {
    const app = getApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/votes',
      payload: { fixtureId: 'f1', votedForId: 'u2' }
    });
    expect(response.statusCode).toBe(401);
  });
});
