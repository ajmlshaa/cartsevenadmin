import React, { createContext, useContext } from 'react';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const INR_CURRENCY: CurrencyConfig = {
  code: 'INR',
  symbol: '₹ ',
  name: 'Indian Rupee (INR)',
  locale: 'en-IN',
};

export const CURRENCIES: Record<string, CurrencyConfig> = {
  INR: INR_CURRENCY,
};

interface CurrencyContextType {
  currency: CurrencyConfig;
  setCurrencyCode: (code: string) => void;
  formatMoney: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currency = INR_CURRENCY;

  // Kept for interface compatibility, strictly locked to INR
  const setCurrencyCode = (_code: string) => {
    localStorage.setItem('cartseven_currency', 'INR');
  };

  const formatMoney = (amount: number = 0): string => {
    const formatted = Math.abs(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    if (amount < 0) {
      return `-₹${formatted}`;
    }
    return `₹${formatted}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrencyCode, formatMoney }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};
