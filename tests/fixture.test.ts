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
  test('POST /api/fixtures/:id/goals rejects if unauthenticated', async () => {
    const app = getApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/fixtures/f1/goals',
      payload: { scorerId: 's1', minute: 90 }
    });
    expect(response.statusCode).toBe(401);
  });
});
