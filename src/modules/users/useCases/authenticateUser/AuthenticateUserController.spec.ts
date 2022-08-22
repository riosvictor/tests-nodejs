import { app } from '../../../../app';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

let connection: Connection;
const userData = {
  name: 'John Doe',
  email: 'john@email.com',
  password: 'password',
};

describe('Auth User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
  });

  afterEach(async () => {
    await connection.query('DELETE FROM users');
  });

  afterAll(async () => {
    await connection.close();
  });

  it('auth success', async () => {
    await request(app)
      .post('/api/v1/users')
      .send(userData);

    const response = await request(app)
      .post('/api/v1/sessions')
      .send(userData);

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('token');
  })

  it('exception user not found', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send(userData);

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: 'Incorrect email or password',
    });
  })

  it('exception password incorrect', async () => {
    await request(app)
      .post('/api/v1/users')
      .send(userData);

    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        ...userData,
        password: 'wrong password',
      });

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: 'Incorrect email or password',
    });
  })
})
