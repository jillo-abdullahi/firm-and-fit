import { getApp } from './setup';

describe('Fixture Routes', () => {
  test('POST /api/fixtures rejects if unauthenticated', async () => {
    const app = getApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/fixtures',
      payload: { opponentId: 'o1', isHome: true, date: '2025-01-01', location: 'Home', type: 'LEAGUE' }
    });
    expect(response.statusCode).toBe(401);
  });
});
