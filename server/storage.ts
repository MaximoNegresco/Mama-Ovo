import {
  users, servers, subscriptionTiers, commands, products, sales, serverSubscriptions, botSettings,
  type User, type InsertUser,
  type Server, type InsertServer,
  type SubscriptionTier, type InsertSubscriptionTier,
  type Command, type InsertCommand,
  type Product, type InsertProduct,
  type Sale, type InsertSale,
  type ServerSubscription, type InsertServerSubscription,
  type BotSettings, type InsertBotSettings
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByDiscordId(discordUserId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  listUsers(): Promise<User[]>;

  // Servers
  getServer(id: number): Promise<Server | undefined>;
  getServerByDiscordId(discordServerId: string): Promise<Server | undefined>;
  createServer(server: InsertServer): Promise<Server>;
  updateServer(id: number, server: Partial<InsertServer>): Promise<Server | undefined>;
  listServers(): Promise<Server[]>;
  listServersByOwner(ownerId: number): Promise<Server[]>;

  // Subscription Tiers
  getSubscriptionTier(id: number): Promise<SubscriptionTier | undefined>;
  createSubscriptionTier(tier: InsertSubscriptionTier): Promise<SubscriptionTier>;
  updateSubscriptionTier(id: number, tier: Partial<InsertSubscriptionTier>): Promise<SubscriptionTier | undefined>;
  listSubscriptionTiers(): Promise<SubscriptionTier[]>;

  // Commands
  getCommand(id: number): Promise<Command | undefined>;
  getCommandByName(name: string): Promise<Command | undefined>;
  createCommand(command: InsertCommand): Promise<Command>;
  updateCommand(id: number, command: Partial<InsertCommand>): Promise<Command | undefined>;
  incrementCommandUsage(id: number): Promise<void>;
  listCommands(): Promise<Command[]>;
  listCommandsBySubscriptionLevel(level: number): Promise<Command[]>;

  // Products
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  listProducts(): Promise<Product[]>;
  listProductsByServer(serverId: number): Promise<Product[]>;

  // Sales
  getSale(id: number): Promise<Sale | undefined>;
  createSale(sale: InsertSale): Promise<Sale>;
  updateSale(id: number, sale: Partial<InsertSale>): Promise<Sale | undefined>;
  listSales(): Promise<Sale[]>;
  listSalesByServer(serverId: number): Promise<Sale[]>;
  listSalesByClient(clientId: number): Promise<Sale[]>;
  getRecentSales(limit: number): Promise<Sale[]>;
  getSalesStats(): Promise<{ totalSales: number, totalAmount: number }>;

  // Server Subscriptions
  getServerSubscription(id: number): Promise<ServerSubscription | undefined>;
  getActiveServerSubscription(serverId: number): Promise<ServerSubscription | undefined>;
  createServerSubscription(subscription: InsertServerSubscription): Promise<ServerSubscription>;
  updateServerSubscription(id: number, subscription: Partial<InsertServerSubscription>): Promise<ServerSubscription | undefined>;
  listServerSubscriptions(): Promise<ServerSubscription[]>;

  // Bot Settings
  getBotSettings(serverId: number): Promise<BotSettings | undefined>;
  createOrUpdateBotSettings(serverId: number, settings: any): Promise<BotSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private servers: Map<number, Server>;
  private subscriptionTiers: Map<number, SubscriptionTier>;
  private commands: Map<number, Command>;
  private products: Map<number, Product>;
  private sales: Map<number, Sale>;
  private serverSubscriptions: Map<number, ServerSubscription>;
  private botSettings: Map<number, BotSettings>;

  private userId = 1;
  private serverId = 1;
  private tierId = 1;
  private commandId = 1;
  private productId = 1;
  private saleId = 1;
  private subscriptionId = 1;
  private settingsId = 1;

  constructor() {
    this.users = new Map();
    this.servers = new Map();
    this.subscriptionTiers = new Map();
    this.commands = new Map();
    this.products = new Map();
    this.sales = new Map();
    this.serverSubscriptions = new Map();
    this.botSettings = new Map();

    // Initialize default data
    this.initDefaultData();
  }

  private initDefaultData() {
    // Default subscription tiers
    const basicTier: InsertSubscriptionTier = {
      name: "Plano Básico",
      price: 4990, // R$ 49,90
      description: "Plano básico com funcionalidades essenciais",
      features: ["Comandos básicos de vendas", "Painel de controle simplificado", "Até 100 vendas/mês"],
      level: 1,
      color: "#3498db",
      maxSales: 100,
      maxServers: 1
    };

    const proTier: InsertSubscriptionTier = {
      name: "Plano Pro",
      price: 8990, // R$ 89,90
      description: "Plano profissional com automação e mais comandos",
      features: ["Todos os comandos de vendas", "Automação de vendas", "Painéis personalizados", "Até 500 vendas/mês"],
      level: 2,
      color: "#7289DA",
      maxSales: 500,
      maxServers: 3
    };

    const premiumTier: InsertSubscriptionTier = {
      name: "Plano Premium",
      price: 12990, // R$ 129,90
      description: "Plano premium com recursos ilimitados",
      features: ["Todos os recursos do Pro", "Integração com plataformas", "API completa", "Vendas ilimitadas"],
      level: 3,
      color: "#9b59b6",
      maxSales: null,
      maxServers: 10
    };

    this.createSubscriptionTier(basicTier);
    this.createSubscriptionTier(proTier);
    this.createSubscriptionTier(premiumTier);

    // Default commands
    const commands: InsertCommand[] = [
      {
        name: "vender",
        description: "Processa uma nova venda com pagamento",
        usage: "/vender produto:string valor:number cliente:user",
        category: "vendas",
        minSubscriptionLevel: 2,
        isActive: true,
        usageCount: 283,
        icon: "fas fa-shopping-cart"
      },
      {
        name: "relatorio",
        description: "Gera relatório de vendas por período",
        usage: "/relatorio inicio:date fim:date [tipo:string]",
        category: "relatorios",
        minSubscriptionLevel: 1,
        isActive: true,
        usageCount: 156,
        icon: "fas fa-chart-line"
      },
      {
        name: "config",
        description: "Configuração rápida de automação",
        usage: "/config modulo:string ativar:boolean",
        category: "configuracao",
        minSubscriptionLevel: 3,
        isActive: true,
        usageCount: 129,
        icon: "fas fa-cog"
      },
      {
        name: "produto",
        description: "Gerencia produtos para venda",
        usage: "/produto [adicionar|editar|remover] nome:string [preco:number] [descricao:string]",
        category: "produtos",
        minSubscriptionLevel: 1,
        isActive: true,
        usageCount: 97,
        icon: "fas fa-tag"
      },
      {
        name: "cliente",
        description: "Gerencia informações de clientes",
        usage: "/cliente [adicionar|buscar|historico] user:user",
        category: "clientes",
        minSubscriptionLevel: 2,
        isActive: true,
        usageCount: 75,
        icon: "fas fa-user"
      },
      {
        name: "painel",
        description: "Cria painéis interativos de venda",
        usage: "/painel [produto|categoria] id:number canal:channel",
        category: "paineis",
        minSubscriptionLevel: 2,
        isActive: true,
        usageCount: 53,
        icon: "fas fa-columns"
      }
    ];

    commands.forEach(cmd => this.createCommand(cmd));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByDiscordId(discordUserId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.discordUserId === discordUserId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Server methods
  async getServer(id: number): Promise<Server | undefined> {
    return this.servers.get(id);
  }

  async getServerByDiscordId(discordServerId: string): Promise<Server | undefined> {
    return Array.from(this.servers.values()).find(
      (server) => server.discordServerId === discordServerId,
    );
  }

  async createServer(insertServer: InsertServer): Promise<Server> {
    const id = this.serverId++;
    const server: Server = { ...insertServer, id };
    this.servers.set(id, server);
    return server;
  }

  async updateServer(id: number, server: Partial<InsertServer>): Promise<Server | undefined> {
    const existingServer = this.servers.get(id);
    if (!existingServer) return undefined;
    
    const updatedServer = { ...existingServer, ...server };
    this.servers.set(id, updatedServer);
    return updatedServer;
  }

  async listServers(): Promise<Server[]> {
    return Array.from(this.servers.values());
  }

  async listServersByOwner(ownerId: number): Promise<Server[]> {
    return Array.from(this.servers.values()).filter(
      (server) => server.ownerId === ownerId
    );
  }

  // Subscription Tier methods
  async getSubscriptionTier(id: number): Promise<SubscriptionTier | undefined> {
    return this.subscriptionTiers.get(id);
  }

  async createSubscriptionTier(insertTier: InsertSubscriptionTier): Promise<SubscriptionTier> {
    const id = this.tierId++;
    const tier: SubscriptionTier = { ...insertTier, id };
    this.subscriptionTiers.set(id, tier);
    return tier;
  }

  async updateSubscriptionTier(id: number, tier: Partial<InsertSubscriptionTier>): Promise<SubscriptionTier | undefined> {
    const existingTier = this.subscriptionTiers.get(id);
    if (!existingTier) return undefined;
    
    const updatedTier = { ...existingTier, ...tier };
    this.subscriptionTiers.set(id, updatedTier);
    return updatedTier;
  }

  async listSubscriptionTiers(): Promise<SubscriptionTier[]> {
    return Array.from(this.subscriptionTiers.values());
  }

  // Command methods
  async getCommand(id: number): Promise<Command | undefined> {
    return this.commands.get(id);
  }

  async getCommandByName(name: string): Promise<Command | undefined> {
    return Array.from(this.commands.values()).find(
      (command) => command.name === name
    );
  }

  async createCommand(insertCommand: InsertCommand): Promise<Command> {
    const id = this.commandId++;
    const command: Command = { ...insertCommand, id };
    this.commands.set(id, command);
    return command;
  }

  async updateCommand(id: number, command: Partial<InsertCommand>): Promise<Command | undefined> {
    const existingCommand = this.commands.get(id);
    if (!existingCommand) return undefined;
    
    const updatedCommand = { ...existingCommand, ...command };
    this.commands.set(id, updatedCommand);
    return updatedCommand;
  }

  async incrementCommandUsage(id: number): Promise<void> {
    const command = this.commands.get(id);
    if (command) {
      command.usageCount += 1;
      this.commands.set(id, command);
    }
  }

  async listCommands(): Promise<Command[]> {
    return Array.from(this.commands.values());
  }

  async listCommandsBySubscriptionLevel(level: number): Promise<Command[]> {
    return Array.from(this.commands.values()).filter(
      (command) => command.minSubscriptionLevel <= level && command.isActive
    );
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async listProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async listProductsByServer(serverId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.serverId === serverId
    );
  }

  // Sale methods
  async getSale(id: number): Promise<Sale | undefined> {
    return this.sales.get(id);
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const id = this.saleId++;
    const sale: Sale = { ...insertSale, id, createdAt: new Date() };
    this.sales.set(id, sale);
    return sale;
  }

  async updateSale(id: number, sale: Partial<InsertSale>): Promise<Sale | undefined> {
    const existingSale = this.sales.get(id);
    if (!existingSale) return undefined;
    
    const updatedSale = { ...existingSale, ...sale };
    this.sales.set(id, updatedSale);
    return updatedSale;
  }

  async listSales(): Promise<Sale[]> {
    return Array.from(this.sales.values());
  }

  async listSalesByServer(serverId: number): Promise<Sale[]> {
    return Array.from(this.sales.values()).filter(
      (sale) => sale.serverId === serverId
    );
  }

  async listSalesByClient(clientId: number): Promise<Sale[]> {
    return Array.from(this.sales.values()).filter(
      (sale) => sale.clientId === clientId
    );
  }

  async getRecentSales(limit: number): Promise<Sale[]> {
    return Array.from(this.sales.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getSalesStats(): Promise<{ totalSales: number, totalAmount: number }> {
    const sales = Array.from(this.sales.values());
    const totalSales = sales.length;
    const totalAmount = sales.reduce((sum, sale) => sum + sale.price, 0);
    return { totalSales, totalAmount };
  }

  // Server Subscription methods
  async getServerSubscription(id: number): Promise<ServerSubscription | undefined> {
    return this.serverSubscriptions.get(id);
  }

  async getActiveServerSubscription(serverId: number): Promise<ServerSubscription | undefined> {
    return Array.from(this.serverSubscriptions.values()).find(
      (sub) => sub.serverId === serverId && sub.isActive
    );
  }

  async createServerSubscription(insertSubscription: InsertServerSubscription): Promise<ServerSubscription> {
    const id = this.subscriptionId++;
    const subscription: ServerSubscription = {
      ...insertSubscription,
      id,
      startDate: new Date(),
    };
    this.serverSubscriptions.set(id, subscription);
    return subscription;
  }

  async updateServerSubscription(id: number, subscription: Partial<InsertServerSubscription>): Promise<ServerSubscription | undefined> {
    const existingSubscription = this.serverSubscriptions.get(id);
    if (!existingSubscription) return undefined;
    
    const updatedSubscription = { ...existingSubscription, ...subscription };
    this.serverSubscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  async listServerSubscriptions(): Promise<ServerSubscription[]> {
    return Array.from(this.serverSubscriptions.values());
  }

  // Bot Settings methods
  async getBotSettings(serverId: number): Promise<BotSettings | undefined> {
    return Array.from(this.botSettings.values()).find(
      (settings) => settings.serverId === serverId
    );
  }

  async createOrUpdateBotSettings(serverId: number, settings: any): Promise<BotSettings> {
    const existingSettings = await this.getBotSettings(serverId);
    
    if (existingSettings) {
      existingSettings.settings = settings;
      this.botSettings.set(existingSettings.id, existingSettings);
      return existingSettings;
    } else {
      const id = this.settingsId++;
      const newSettings: BotSettings = {
        id,
        serverId,
        settings
      };
      this.botSettings.set(id, newSettings);
      return newSettings;
    }
  }
}

export const storage = new MemStorage();
