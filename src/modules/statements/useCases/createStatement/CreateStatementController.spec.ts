import { app } from '../../../../app';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

let connection: Connection;
const userData = {
  name: 'John Doe',
  email: 'john@email.com',
  password: 'password',
};

const depositData = {
  amount: '100.00',
  description: 'first deposit'
};

const clearUsers = async () => {
  await connection.query('DELETE FROM users');
};

describe('Create Statement Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
  });

  afterEach(async () => {
    await clearUsers();
  });

  afterAll(async () => {
    await connection.close();
  });

  it('create deposit', async () => {
    await request(app)
      .post('/api/v1/users')
      .send(userData);

    const { body: { token } } = await request(app)
      .post('/api/v1/sessions')
      .send(userData);

    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send(depositData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  })

  it('create withdraw', async () => {
    await request(app)
      .post('/api/v1/users')
      .send(userData);

    const { body: { token } } = await request(app)
      .post('/api/v1/sessions')
      .send(userData);

    await request(app)
      .post('/api/v1/statements/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send(depositData);

    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 80,
        description: "first withdraw"
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  })

  it('create withdraw insufficient', async () => {
    await request(app)
      .post('/api/v1/users')
      .send(userData);

    const { body: { token } } = await request(app)
      .post('/api/v1/sessions')
      .send(userData);

    await request(app)
      .post('/api/v1/statements/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send(depositData);

    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 110,
        description: "first withdraw"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Insufficient funds');
  })

  it('user not found', async () => {
    await request(app)
      .post('/api/v1/users')
      .send(userData);

    const { body: { token } } = await request(app)
      .post('/api/v1/sessions')
      .send(userData);

    await await clearUsers();

    const response = await request(app)
      .get(`/api/v1/statements/balance`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('User not found')
  })

  it('exception JWT token not found', async () => {
    const response = await request(app)
      .get(`/api/v1/statements/balance`);

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: 'JWT token is missing!',
    });
  })
})
