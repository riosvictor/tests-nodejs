import { app } from '../../../../app';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

let connection: Connection;
const userData = {
  name: 'John Doe',
  email: 'john@email.com',
  password: 'password',
};

describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
  });

  afterEach(async () => {
    await connection.query('DELETE FROM users');
  });

  afterAll(async () => {
    await connection.close();
  });

  it('insert user', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send(userData);

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({});
  })

  it('exception user already exists', async () => {
    await request(app)
      .post('/api/v1/users')
      .send(userData);

    const response = await request(app)
      .post('/api/v1/users')
      .send(userData);

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      message: 'User already exists',
    });
  })
})
