import { app } from '../../../../app';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

let connection: Connection;
const userData = {
  name: 'John Doe',
  email: 'john@email.com',
  password: 'password',
};

describe('Show User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
  });

  afterEach(async () => {
    await connection.query('DELETE FROM users');
  });

  afterAll(async () => {
    await connection.close();
  });

  it('get user success', async () => {
    await request(app)
      .post('/api/v1/users')
      .send(userData);

    const { body: { token } } = await request(app)
      .post('/api/v1/sessions')
      .send(userData);

    const response = await request(app)
      .get('/api/v1/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(userData);

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('id');
  })

  it('exception JWT token not found', async () => {
    const response = await request(app)
      .get('/api/v1/profile')
      .send(userData);

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: 'JWT token is missing!',
    });
  })
})
