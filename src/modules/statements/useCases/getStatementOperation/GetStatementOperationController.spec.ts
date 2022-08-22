import { app } from '../../../../app';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

let connection: Connection;
const userData = {
  name: 'John Doe',
  email: 'john@email.com',
  password: 'password',
};
const randomId = '82c6d124-ce1c-4925-be9d-98df26d29723';

const clearUsers = async () => {
  await connection.query('DELETE FROM users');
};

describe('Get Statement Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
  });

  afterEach(async () => {
    await clearUsers();
  });

  afterAll(async () => {
    await connection.close();
  });

  it('get statement success', async () => {
    const depositData = {
      amount: '100.00',
      description: 'first deposit'
    };

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

    const { body: { statement: [ firstStatement ] } } = await request(app)
      .get('/api/v1/statements/balance')
      .set('Authorization', `Bearer ${token}`);

    const response = await request(app)
      .get(`/api/v1/statements/${firstStatement.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.amount).toBe(depositData.amount);
    expect(response.body.description).toBe(depositData.description);
  })

  it('get statement success', async () => {
    await request(app)
      .post('/api/v1/users')
      .send(userData);

    const { body: { token } } = await request(app)
      .post('/api/v1/sessions')
      .send(userData);

    const response = await request(app)
      .get(`/api/v1/statements/${randomId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Statement not found');
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
      .get(`/api/v1/statements/${randomId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('User not found')
  })

  it('exception JWT token not found', async () => {
    const response = await request(app)
      .get(`/api/v1/statements/${randomId}`);

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: 'JWT token is missing!',
    });
  })
})
