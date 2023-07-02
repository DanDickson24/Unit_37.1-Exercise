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

describe('GET /companies', () => {
  test('should return a list of companies', async () => {
    const response = await request(app).get('/companies');
    expect(response.status).toBe(200);
    expect(response.body.companies).toHaveLength(2); 
  });


});

describe('GET /companies/:code', () => {
  test('should return details of a specific company', async () => {
    const response = await request(app).get('/companies/TEST');
    expect(response.status).toBe(200);
    expect(response.body.company.code).toBe('TEST');

  });


});
