import request from 'supertest';
import app from '../api';

describe('Eendpoint integration testing', () => {
  it('Should return movie data with the largest and smallest intervals', async () => {
    const response = await request(app).get('/movies');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('max');
    expect(response.body).toHaveProperty('min');
  });
});
