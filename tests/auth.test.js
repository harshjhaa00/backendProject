// tests/auth.test.js
// Integration tests for authentication and protected routes.

process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';
process.env.ACCESS_TOKEN_EXPIRES = '15m';
process.env.REFRESH_TOKEN_EXPIRES = '7d';

import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { app } from '../src/server.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: 'test-auth' });
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Authentication flow', () => {
  it('registers a user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'ValidPass123',
      })
      .expect(201);

    expect(response.body.user).toMatchObject({
      name: 'Test User',
      email: 'test@example.com',
    });

    expect(response.body.tokens.accessToken).toBeTruthy();
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('refreshToken')])
    );
  });

  it('rejects duplicate registration emails', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'ValidPass123',
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another User',
        email: 'test@example.com',
        password: 'ValidPass123',
      })
      .expect(409);

    expect(response.body.message).toMatch(/already in use/i);
  });

  it('logs in and accesses the protected profile route', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'ValidPass123',
    });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'ValidPass123',
      })
      .expect(200);

    const accessToken = loginResponse.body.tokens.accessToken;
    expect(accessToken).toBeTruthy();

    await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .then((res) => {
        expect(res.body.email).toBe('test@example.com');
      });
  });
});

