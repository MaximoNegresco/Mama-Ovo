// Discord-specific styles and constants

export const DISCORD_COLORS = {
  BG: 'var(--discord-bg)',
  SIDEBAR: 'var(--discord-sidebar)',
  PRIMARY: 'var(--discord-primary)',
  SUCCESS: 'var(--discord-success)',
  ERROR: 'var(--discord-error)',
  WARNING: 'var(--discord-warning)',
  LIGHT: 'var(--discord-light)',
  MUTED: 'var(--discord-muted)',
  DARK: 'var(--discord-dark)',
  CARD: 'var(--discord-card)',
  HOVER: 'var(--discord-hover)',
};

export const SUBSCRIPTION_LEVELS = {
  FREE: 0,
  BASIC: 1,
  PRO: 2,
  PREMIUM: 3,
};

export const SUBSCRIPTION_LEVEL_NAMES = {
  [SUBSCRIPTION_LEVELS.FREE]: 'Gratuito',
  [SUBSCRIPTION_LEVELS.BASIC]: 'Básico',
  [SUBSCRIPTION_LEVELS.PRO]: 'Pro',
  [SUBSCRIPTION_LEVELS.PREMIUM]: 'Premium',
};

export const SALE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled',
};

export const SALE_STATUS_NAMES = {
  [SALE_STATUS.PENDING]: 'Pendente',
  [SALE_STATUS.PAID]: 'Pago',
  [SALE_STATUS.CANCELLED]: 'Cancelado',
};

export const SALE_STATUS_COLORS = {
  [SALE_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [SALE_STATUS.PAID]: 'bg-green-100 text-green-800',
  [SALE_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
};

export const DEFAULT_PAGINATION_LIMIT = 10;
