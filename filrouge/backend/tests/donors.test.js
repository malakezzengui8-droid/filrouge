import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';

const TEST_DB_URI ="mongodb+srv://ausralia37:b6sZPkmnip8InvoN@cluster0.c8oxb5f.mongodb.net/filRouge";

let token;

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);

  const user=await request(app).post('/api/auth/register').send({
    name: 'Donor One',
    email: 'donor1@example.com',
    password: '123456',
    city: 'Casablanca',
    bloodType: 'O_NEGATIVE',
    CIN:"L123456"
  });
 
console.log(user.statusCode);
console.log(user.body);

  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'donor1@example.com',
    password: '123456'
  });
  console.log(loginRes.body)

  token = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Donor search endpoints', () => {
  test('GET /api/donors requires authentication', async () => {
    const res = await request(app).get('/api/donors');

    expect(res.statusCode).toBe(401);
  });

  test('GET /api/donors returns matching donors by city', async () => {
    const res = await request(app)
      .get('/api/donors?city=Casablanca')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/donors rejects an invalid blood type', async () => {
    const res = await request(app)
      .get('/api/donors?bloodType=INVALID')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });
});