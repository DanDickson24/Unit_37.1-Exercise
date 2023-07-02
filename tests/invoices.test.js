const request = require('supertest');
const app = require('../app');
const db = require('../db');

beforeEach(async () => {

});

afterEach(async () => {
});

afterAll(async () => {
  await db.end();
});

describe('GET /invoices', () => {
  test('should return a list of invoices', async () => {
    const response = await request(app).get('/invoices');
    expect(response.status).toBe(200);
    expect(response.body.invoices).toHaveLength(2); 
  });


});

describe('GET /invoices/:id', () => {
  test('should return details of a specific invoice', async () => {
    const response = await request(app).get('/invoices/1');
    expect(response.status).toBe(200);
    expect(response.body.invoice.id).toBe(1);
  });

});

