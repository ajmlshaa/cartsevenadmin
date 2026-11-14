import { describe, it, expect } from 'vitest';
import { DEMO_USERS } from '../context/AuthContext';
import { ESSENTIAL_LEDGER_GROUPS } from '../pages/ChartOfAccounts';

describe('CartSeven Frontend & Accounting Logic Test Suite', () => {
  describe('1. Currency Formatting (INR Only)', () => {
    const formatINR = (amount: number): string => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    };

    it('Formats zero balance properly as ₹0.00', () => {
      const formatted = formatINR(0);
      expect(formatted).toMatch(/₹\s?0\.00/);
    });

    it('Formats standard amounts with Indian numbering system', () => {
      const formatted = formatINR(100000);
      expect(formatted).toMatch(/₹\s?1,00,000\.00/);
    });
  });

  describe('2. Three Business Partners Configuration', () => {
    it('Configures AJMALSHA as Managing Partner (admin)', () => {
      const partner = DEMO_USERS.partner1;
      expect(partner.name).toBe('AJMALSHA');
      expect(partner.email).toBe('ajmalsha@cartseven.com');
      expect(partner.role).toBe('admin');
    });

    it('Configures ASHIQUE SALIM as Finance Partner (accountant)', () => {
      const partner = DEMO_USERS.partner2;
      expect(partner.name).toBe('ASHIQUE SALIM');
      expect(partner.email).toBe('ashique@cartseven.com');
      expect(partner.role).toBe('accountant');
    });

    it('Configures SHANU as Operations Partner (manager)', () => {
      const partner = DEMO_USERS.partner3;
      expect(partner.name).toBe('SHANU');
      expect(partner.email).toBe('shanu@cartseven.com');
      expect(partner.role).toBe('manager');
    });

    it('Generates two-letter initials correctly for all partners', () => {
      const getInitials = (name?: string): string => {
        if (!name) return 'P';
        const parts = name.trim().split(/\s+/);
        if (parts.length > 1) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
      };

      expect(getInitials('AJMALSHA')).toBe('AJ');
      expect(getInitials('ASHIQUE SALIM')).toBe('AS');
      expect(getInitials('SHANU')).toBe('SH');
    });
  });

  describe('3. Chart of Accounts & Capital Accounts', () => {
    it('Includes all 3 Partner Capital and Drawings accounts in Group A', () => {
      const groupA = ESSENTIAL_LEDGER_GROUPS.find((g) => g.groupTitle.includes('Capital and Liability'));
      expect(groupA).toBeDefined();

      const accountNames = groupA!.accounts.map((a) => a.name);
      expect(accountNames).toContain('AJMALSHA Capital Account');
      expect(accountNames).toContain('ASHIQUE SALIM Capital Account');
      expect(accountNames).toContain('SHANU Capital Account');
      expect(accountNames).toContain('AJMALSHA Drawings Account');
      expect(accountNames).toContain('ASHIQUE SALIM Drawings Account');
      expect(accountNames).toContain('SHANU Drawings Account');
    });

    it('Ensures all predefined accounts have starting zero balance', () => {
      ESSENTIAL_LEDGER_GROUPS.forEach((group) => {
        group.accounts.forEach((acc) => {
          expect(acc.balance).toBe(0);
        });
      });
    });
  });
});
