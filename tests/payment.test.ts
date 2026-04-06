import { getApp } from './setup';

describe('Payment Routes', () => {
  test('POST /api/payments/monthly rejects unauthenticated', async () => {
    const app = getApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/payments/monthly',
      payload: { month: '2024-01', amount: 30 }
    });
    expect(response.statusCode).toBe(401);
  });
});
