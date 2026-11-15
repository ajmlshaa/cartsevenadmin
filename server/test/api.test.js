import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('CartSeven Backend API Test Suite', () => {
  let p1Token = '';
  let p2Token = '';
  let p3Token = '';

  it('1. Health Check - Server is online and responding', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.app).toBe('CartSeven Accounting API');
  });

  describe('2. Three Partner Authentication', () => {
    it('Logs in Partner 1: AJMALSHA (Managing Partner)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ajmalsha@cartseven.com',
          password: 'password123',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.name).toBe('AJMALSHA');
      expect(res.body.user.role).toBe('admin');
      p1Token = res.body.token;
    });

    it('Logs in Partner 2: ASHIQUE SALIM (Finance Partner)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ashique@cartseven.com',
          password: 'password123',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.name).toBe('ASHIQUE SALIM');
      expect(res.body.user.role).toBe('accountant');
      p2Token = res.body.token;
    });

    it('Logs in Partner 3: SHANU (Operations Partner)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'shanu@cartseven.com',
          password: 'password123',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.name).toBe('SHANU');
      expect(res.body.user.role).toBe('manager');
      p3Token = res.body.token;
    });

    it('Rejects invalid password attempt', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ajmalsha@cartseven.com',
          password: 'wrong_password_999',
        });
      expect([400, 401]).toContain(res.status);
    });

    it('Rejects unauthorized non-partner user and directs to https://cartseven.com/', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'stranger@gmail.com',
          password: 'password123',
        });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.redirectUrl).toBe('https://cartseven.com/');
    });

    it('Provides public access-info with redirect to https://cartseven.com/', async () => {
      const res = await request(app).get('/api/auth/access-info');
      expect(res.status).toBe(200);
      expect(res.body.restricted).toBe(true);
      expect(res.body.redirectUrl).toBe('https://cartseven.com/');
    });
  });

  describe('3. Partners & Team Directory', () => {
    it('Fetches list of partners using authenticated JWT', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${p1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      const names = res.body.data.map((u) => u.name);
      expect(names).toContain('AJMALSHA');
      expect(names).toContain('ASHIQUE SALIM');
      expect(names).toContain('SHANU');
    });

    it('Provides robust fallback when token is not present in local mode', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('4. Chart of Accounts & 3 Capital Ledgers', () => {
    it('Fetches accounts and verifies all 3 Partner Capital Accounts exist', async () => {
      const res = await request(app)
        .get('/api/accounts')
        .set('Authorization', `Bearer ${p1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const accounts = res.body.data;
      const accountNames = accounts.map((a) => a.name);

      expect(accountNames).toContain('AJMALSHA Capital Account');
      expect(accountNames).toContain('ASHIQUE SALIM Capital Account');
      expect(accountNames).toContain('SHANU Capital Account');
      expect(accountNames).toContain('AJMALSHA Drawings Account');
      expect(accountNames).toContain('ASHIQUE SALIM Drawings Account');
      expect(accountNames).toContain('SHANU Drawings Account');
    });
  });

  describe('5. Double-Entry Vouchers & Reports Integration', () => {
    it('Fetches Balance Sheet report and confirms Equity section structure', async () => {
      const res = await request(app)
        .get('/api/reports/balance-sheet')
        .set('Authorization', `Bearer ${p1Token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assets).toBeDefined();
      expect(res.body.data.liabilities).toBeDefined();
      expect(res.body.data.liabilities.equity).toBeDefined();

      const equityNames = res.body.data.liabilities.equity.map((e) => e.name);
      expect(equityNames.some((n) => n.includes('AJMALSHA'))).toBe(true);
      expect(equityNames.some((n) => n.includes('ASHIQUE SALIM'))).toBe(true);
      expect(equityNames.some((n) => n.includes('SHANU'))).toBe(true);
    });

    it('Posts a test Receipt Voucher for Capital Introduced', async () => {
      const voucherData = {
        type: 'Receipt Voucher',
        date: new Date().toISOString(),
        debitAccount: 'Bank Account - HDFC Current',
        creditAccount: 'AJMALSHA Capital Account',
        amount: 50000,
        collectionMethod: 'Direct Bank Transfer (NEFT/RTGS)',
        partyName: 'AJMALSHA Capital Injection',
        referenceNumber: 'NEFT-TEST-001',
        narration: 'Initial working capital deposit into HDFC current account',
      };

      const res = await request(app)
        .post('/api/vouchers')
        .set('Authorization', `Bearer ${p1Token}`)
        .send(voucherData);

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(50000);
    });

    it('Verifies the newly created voucher in voucher register', async () => {
      const res = await request(app)
        .get('/api/vouchers?type=Receipt Voucher')
        .set('Authorization', `Bearer ${p1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((v) => v.partyName === 'AJMALSHA Capital Injection')).toBe(true);
    });
  });
});
