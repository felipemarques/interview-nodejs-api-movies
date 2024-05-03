import request from 'supertest';
import app, { init } from '../api';

describe('GET /movies Endpoint Test', () => {
  beforeAll(async () => {
    await init();
  });

  it('Should successfully retrieve movie data from the endpoint', async () => {
    const response = await request(app).get('/movies');

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty('max');
    expect(response.body).toHaveProperty('min');
  });
});
