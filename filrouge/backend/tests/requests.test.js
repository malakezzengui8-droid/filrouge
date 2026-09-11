import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';

const TEST_DB_URI ="mongodb+srv://ausralia37:b6sZPkmnip8InvoN@cluster0.c8oxb5f.mongodb.net/filRouge";

let token;

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);

  await request(app).post('/api/auth/register').send({
    name: 'Requester One',
    email: 'requester1@example.com',
    password: '123456',
    city: 'Rabat',
    bloodType: 'AB_NEGATIVE',
    CIN:"l12345"
  });

  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'requester1@example.com',
    password: '123456'
  });
  console.log(loginRes.body)

  token = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Blood request endpoints', () => {
  let requestId;

  test('POST /api/requests publishes a new request', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bloodTypeNeeded: 'AB_NEGATIVE',
        city: 'Rabat',
        hospital: 'Hopital Ibn Sina',
        reason: 'Surgery'
      });
      console.log(res.body)

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ACTIVE');
    requestId = res.body._id;
  });

  test('POST /api/requests rejects missing required fields', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${token}`)
      .send({ bloodTypeNeeded: 'AB_NEGATIVE' }); // missing city, hospital

    expect(res.statusCode).toBe(400);
  });

  test('GET /api/requests lists active requests', async () => {
    const res = await request(app)
      .get('/api/requests')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/requests/:id/compatible-donors returns a list', async () => {
    const res = await request(app)
      .get(`/api/requests/${requestId}/compatible-donors`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('PUT /api/requests/:id/status updates status as the owner', async () => {
    const res = await request(app)
      .put(`/api/requests/${requestId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'FULFILLED' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('FULFILLED');
  });
}); 