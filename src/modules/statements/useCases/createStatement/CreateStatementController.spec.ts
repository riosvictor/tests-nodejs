import { app } from '../../../../app';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

let connection: Connection;
const userData = {
  name: 'John Doe',
  email: 'john@email.com',
  password: 'password',
};

const receiverUserData = {
  name: 'John Doe',
  email: 'batatinha@email.com',
  password: 'password',
};

const depositData = {
  amount: '100.00',
  description: 'first deposit'
};

const clearUsers = async () => {
  await connection.query('DELETE FROM users');
};

const randomId = '82c6d124-ce1c-4925-be9d-98df26d29723';

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

  it('create transfer', async () => {
    await request(app)
      .post('/api/v1/users')
      .send(userData);

    await request(app)
      .post('/api/v1/users')
      .send(receiverUserData);

    const { body: { user, token: tokenReceiver } } = await request(app)
      .post('/api/v1/sessions')
      .send(receiverUserData);

    const { body: { token: tokenUser } } = await request(app)
      .post('/api/v1/sessions')
      .send(userData);

    await request(app)
      .post('/api/v1/statements/deposit')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send(depositData);

    const responseTransfer = await request(app)
      .post(`/api/v1/statements/transfers/${user.id}`)
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({
        amount: 80,
        description: `first transfer from ${userData.email} to ${receiverUserData.email}`
      });

    const responseBalanceUser = await request(app)
      .get('/api/v1/statements/balance')
      .set('Authorization', `Bearer ${tokenUser}`);

    const responseBalanceReceiver = await request(app)
      .get('/api/v1/statements/balance')
      .set('Authorization', `Bearer ${tokenReceiver}`);

    expect(responseTransfer.status).toBe(201);
    expect(responseTransfer.body).toHaveProperty('id');

    expect(responseBalanceUser.status).toBe(200);
    expect(responseBalanceUser.body.statement).toHaveLength(2);
    expect(responseBalanceUser.body.balance).toBe(20);

    expect(responseBalanceReceiver.status).toBe(200);
    expect(responseBalanceReceiver.body.statement).toHaveLength(1);
    expect(responseBalanceReceiver.body.balance).toBe(80);
  })

  it('user not found in transfer', async () => {
    await request(app)
      .post('/api/v1/users')
      .send(userData);

    const { body: { token } } = await request(app)
      .post('/api/v1/sessions')
      .send(userData);

    const response = await request(app)
      .post(`/api/v1/statements/transfers/${randomId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 80,
        description: `first transfer from ${userData.email} to ${receiverUserData.email}`
      });

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('User not found')
  })
})
