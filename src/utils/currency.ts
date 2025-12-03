/**
 * Currency formatting utilities
 * Supports multiple currencies with proper localization
 */

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'ZAR' | 'AUD' | 'CAD' | 'INR' | 'JPY' | 'CNY' | 'BRL'

interface CurrencyConfig {
  code: CurrencyCode
  symbol: string
  name: string
  locale: string
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' }
}

// Default currency - can be changed based on user settings
const DEFAULT_CURRENCY: CurrencyCode = 'USD'

/**
 * Get the current currency from localStorage or use default
 */
export function getCurrentCurrency(): CurrencyCode {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('app_currency')
    if (stored && stored in CURRENCIES) {
      return stored as CurrencyCode
    }
  }
  return DEFAULT_CURRENCY
}

/**
 * Set the current currency in localStorage
 */
export function setCurrentCurrency(currency: CurrencyCode): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('app_currency', currency)
  }
}

/**
 * Get the currency symbol for the current or specified currency
 */
export function getCurrencySymbol(currency?: CurrencyCode): string {
  const curr = currency || getCurrentCurrency()
  return CURRENCIES[curr]?.symbol || '$'
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number | null | undefined,
  options?: {
    currency?: CurrencyCode
    showSymbol?: boolean
    decimals?: number
  }
): string {
  const { currency, showSymbol = true, decimals = 2 } = options || {}
  const curr = currency || getCurrentCurrency()
  const config = CURRENCIES[curr]
  
  if (amount === null || amount === undefined) {
    return showSymbol ? `${config.symbol}0.00` : '0.00'
  }

  // For JPY, no decimal places
  const actualDecimals = curr === 'JPY' ? 0 : decimals

  const formatted = amount.toLocaleString(config.locale, {
    minimumFractionDigits: actualDecimals,
    maximumFractionDigits: actualDecimals
  })

  return showSymbol ? `${config.symbol}${formatted}` : formatted
}

/**
 * Format currency with full Intl.NumberFormat for proper localization
 */
export function formatCurrencyFull(
  amount: number | null | undefined,
  currency?: CurrencyCode
): string {
  const curr = currency || getCurrentCurrency()
  const config = CURRENCIES[curr]
  
  if (amount === null || amount === undefined) {
    amount = 0
  }

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: curr
  }).format(amount)
}

/**
 * Parse a currency string back to a number
 */
export function parseCurrency(value: string): number {
  // Remove all non-numeric characters except decimal point and minus
  const cleaned = value.replace(/[^0-9.-]/g, '')
  return parseFloat(cleaned) || 0
}

/**
 * Get all available currencies for selection
 */
export function getAvailableCurrencies(): CurrencyConfig[] {
  return Object.values(CURRENCIES)
}
