import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { jest } from '@jest/globals';
import app from '../../app'; // Replace with the actual path

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Gateway Tests', () => {
  it('should reject requests with missing Authorization token', async () => {
    const res = await request(app).get('/transaction-service').send();
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Authorization token is missing');
  });

  it('should reject requests with invalid Authorization token', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Invalid token'));
    const res = await request(app)
      .get('/transaction-service')
      .set('Authorization', 'Bearer invalidToken')
      .send();

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Failed to validate token');
  });

  it('should pass requests with valid Authorization token', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      status: 200,
      data: { valid: true, user: { id: 'user123', name: 'Test User' } },
    });

    const res = await request(app)
      .get('/transaction-service')
      .set('Authorization', 'Bearer validToken')
      .send();

    expect(res.status).not.toBe(401);
  });
});
