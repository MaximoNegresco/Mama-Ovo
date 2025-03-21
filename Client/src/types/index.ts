import { 
  User, Server, SubscriptionTier, Command, 
  Product, Sale, ServerSubscription, BotSettings 
} from '@shared/schema';

// Dashboard Statistics
export interface DashboardStats {
  sales: {
    total: number;
    amount: number;
    weeklyGrowth: number;
  };
  clients: {
    total: number;
    newToday: number;
  };
  products: {
    total: number;
    active: number;
  };
  servers: {
    total: number;
    limit: number;
  };
}

// Enhanced Sale with additional info for display
export interface EnhancedSale extends Sale {
  productName?: string;
  clientName?: string;
  clientAvatar?: string | null;
  serverName?: string;
}

// Enhanced product with additional info
export interface EnhancedProduct extends Product {
  serverName?: string;
}

// Enhanced command with additional info
export interface EnhancedCommand extends Command {
  tierName?: string;
}

// Filter types for various listings
export interface SalesFilter {
  serverId?: number;
  clientId?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ProductsFilter {
  serverId?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ClientsFilter {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CommandsFilter {
  category?: string;
  minSubscriptionLevel?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// WebSocket message types
export type WebSocketMessageType = 
  | 'NEW_SALE'
  | 'UPDATED_SALE'
  | 'SERVER_STATUS_CHANGE';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
}
