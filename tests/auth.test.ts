import { getApp } from './setup';

describe('Auth Endpoints', () => {
  test('GET /api/auth/me throws UNAUTHORIZED if no token', async () => {
    const app = getApp();
    const response = await app.inject({
      method: 'GET',
      url: '/api/auth/me' // protected route
    });
    
    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe('UNAUTHORIZED');
  });

  test('POST /api/competitions throws UNAUTHORIZED if no admin', async () => {
    const app = getApp();
    const response = await app.inject({
      method: 'POST',
      url: '/api/competitions',
      payload: { name: 'Test', type: 'LEAGUE', season: '2024' }
    });
    
    expect(response.statusCode).toBe(401); 
  });
});
