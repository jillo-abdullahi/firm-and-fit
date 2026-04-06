import { getApp } from './setup';

describe('Attendance Routes', () => {
  test('POST /api/attendance rejects if unauthenticated', async () => {
    const app = getApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/attendance',
      payload: { fixtureId: 'f1', status: 'GOING' }
    });
    expect(response.statusCode).toBe(401);
  });
});
