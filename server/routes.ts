import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { startBot } from "./discord/bot";
import { z } from "zod";
import {
  insertUserSchema,
  insertServerSchema,
  insertSubscriptionTierSchema,
  insertCommandSchema,
  insertProductSchema,
  insertSaleSchema,
  insertServerSubscriptionSchema
} from "@shared/schema";
import { WebSocketServer } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Create a dedicated WebSocket route with its own path
  const wssPath = '/ws';
  const wss = new WebSocketServer({ 
    noServer: true,
    // Explicitly set the path to avoid conflicts with Vite
    path: wssPath 
  });

  // Handle upgrade requests for WebSocket connections
  httpServer.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
    
    if (pathname === wssPath) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  // Initialize bot
  if (process.env.DISCORD_BOT_TOKEN) {
    try {
      await startBot();
      console.log("Discord bot started successfully");
    } catch (error) {
      console.error("Failed to start Discord bot:", error);
    }
  } else {
    console.warn("DISCORD_BOT_TOKEN not provided. Bot functionality will be disabled.");
  }

  // Websocket for real-time updates
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    
    // Send a welcome message to confirm connection
    ws.send(JSON.stringify({ 
      type: 'CONNECTED', 
      data: { 
        message: 'Connected to Discord Sales Bot WebSocket',
        timestamp: new Date().toISOString() 
      } 
    }));
    
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("Received:", data);
        
        // Handle client messages if needed
        if (data.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', data: { timestamp: new Date().toISOString() } }));
        }
      } catch (e) {
        console.error("Invalid message format");
      }
    });
    
    ws.on("close", (code, reason) => {
      console.log(`WebSocket client disconnected. Code: ${code}, Reason: ${reason}`);
    });
    
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  // Authentication middleware (simple version for demo)
  const authenticate = (req: Request, res: Response, next: () => void) => {
    // In production, this would validate a session token
    next();
  };

  // API Routes
  const api = express.Router();
  
  // Users
  api.get("/users", authenticate, async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  api.get("/users/:id", authenticate, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  api.post("/users", authenticate, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  api.patch("/users/:id", authenticate, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Servers
  api.get("/servers", authenticate, async (req, res) => {
    try {
      const servers = await storage.listServers();
      res.json(servers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch servers" });
    }
  });

  api.get("/servers/:id", authenticate, async (req, res) => {
    try {
      const server = await storage.getServer(parseInt(req.params.id));
      if (!server) {
        return res.status(404).json({ error: "Server not found" });
      }
      res.json(server);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch server" });
    }
  });

  api.post("/servers", authenticate, async (req, res) => {
    try {
      const serverData = insertServerSchema.parse(req.body);
      const server = await storage.createServer(serverData);
      res.status(201).json(server);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create server" });
    }
  });

  // Subscription Tiers
  api.get("/subscription-tiers", async (req, res) => {
    try {
      const tiers = await storage.listSubscriptionTiers();
      res.json(tiers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscription tiers" });
    }
  });

  api.get("/subscription-tiers/:id", async (req, res) => {
    try {
      const tier = await storage.getSubscriptionTier(parseInt(req.params.id));
      if (!tier) {
        return res.status(404).json({ error: "Subscription tier not found" });
      }
      res.json(tier);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscription tier" });
    }
  });

  api.post("/subscription-tiers", authenticate, async (req, res) => {
    try {
      const tierData = insertSubscriptionTierSchema.parse(req.body);
      const tier = await storage.createSubscriptionTier(tierData);
      res.status(201).json(tier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create subscription tier" });
    }
  });

  // Commands
  api.get("/commands", async (req, res) => {
    try {
      const commands = await storage.listCommands();
      res.json(commands);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch commands" });
    }
  });

  api.get("/commands/popular", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string || "10");
      const commands = await storage.listCommands();
      const popularCommands = commands
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, limit);
      res.json(popularCommands);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch popular commands" });
    }
  });

  api.get("/commands/:id", async (req, res) => {
    try {
      const command = await storage.getCommand(parseInt(req.params.id));
      if (!command) {
        return res.status(404).json({ error: "Command not found" });
      }
      res.json(command);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch command" });
    }
  });

  api.post("/commands", authenticate, async (req, res) => {
    try {
      const commandData = insertCommandSchema.parse(req.body);
      const command = await storage.createCommand(commandData);
      res.status(201).json(command);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create command" });
    }
  });

  // Products
  api.get("/products", async (req, res) => {
    try {
      const serverId = req.query.serverId ? parseInt(req.query.serverId as string) : undefined;
      
      let products;
      if (serverId) {
        products = await storage.listProductsByServer(serverId);
      } else {
        products = await storage.listProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  api.get("/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  api.post("/products", authenticate, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Sales
  api.get("/sales", authenticate, async (req, res) => {
    try {
      const serverId = req.query.serverId ? parseInt(req.query.serverId as string) : undefined;
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      
      let sales;
      if (serverId) {
        sales = await storage.listSalesByServer(serverId);
      } else if (clientId) {
        sales = await storage.listSalesByClient(clientId);
      } else {
        sales = await storage.listSales();
      }
      
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales" });
    }
  });

  api.get("/sales/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string || "5");
      const recentSales = await storage.getRecentSales(limit);
      
      // Enhance sales data with related info for display
      const enhancedSales = await Promise.all(
        recentSales.map(async (sale) => {
          const product = sale.productId ? await storage.getProduct(sale.productId) : null;
          const client = sale.clientId ? await storage.getUser(sale.clientId) : null;
          
          return {
            ...sale,
            productName: product?.name || "Unknown Product",
            clientName: client?.username || "Unknown Client",
            clientAvatar: client?.avatarUrl || null
          };
        })
      );
      
      res.json(enhancedSales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent sales" });
    }
  });

  api.get("/sales/stats", async (req, res) => {
    try {
      const stats = await storage.getSalesStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales statistics" });
    }
  });

  api.get("/sales/:id", authenticate, async (req, res) => {
    try {
      const sale = await storage.getSale(parseInt(req.params.id));
      if (!sale) {
        return res.status(404).json({ error: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sale" });
    }
  });

  api.post("/sales", authenticate, async (req, res) => {
    try {
      const saleData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(saleData);
      
      // Notify connected clients about new sale
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // OPEN
          client.send(JSON.stringify({ 
            type: 'NEW_SALE',
            data: sale
          }));
        }
      });
      
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create sale" });
    }
  });

  api.patch("/sales/:id", authenticate, async (req, res) => {
    try {
      const saleId = parseInt(req.params.id);
      const saleData = insertSaleSchema.partial().parse(req.body);
      const updatedSale = await storage.updateSale(saleId, saleData);
      
      if (!updatedSale) {
        return res.status(404).json({ error: "Sale not found" });
      }
      
      // Notify connected clients about updated sale
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // OPEN
          client.send(JSON.stringify({ 
            type: 'UPDATED_SALE',
            data: updatedSale
          }));
        }
      });
      
      res.json(updatedSale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update sale" });
    }
  });

  // Server Subscriptions
  api.get("/server-subscriptions", authenticate, async (req, res) => {
    try {
      const subscriptions = await storage.listServerSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch server subscriptions" });
    }
  });

  api.get("/server-subscriptions/:serverId/active", async (req, res) => {
    try {
      const serverId = parseInt(req.params.serverId);
      const subscription = await storage.getActiveServerSubscription(serverId);
      
      if (!subscription) {
        return res.status(404).json({ error: "No active subscription found for this server" });
      }
      
      // Get the tier details
      const tier = await storage.getSubscriptionTier(subscription.tierId);
      
      res.json({
        subscription,
        tier
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active server subscription" });
    }
  });

  api.post("/server-subscriptions", authenticate, async (req, res) => {
    try {
      const subscriptionData = insertServerSubscriptionSchema.parse(req.body);
      const subscription = await storage.createServerSubscription(subscriptionData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create server subscription" });
    }
  });

  // Bot Settings
  api.get("/bot-settings/:serverId", authenticate, async (req, res) => {
    try {
      const serverId = parseInt(req.params.serverId);
      const settings = await storage.getBotSettings(serverId);
      
      if (!settings) {
        return res.json({ settings: {} }); // Return empty settings if none exist
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bot settings" });
    }
  });

  api.post("/bot-settings/:serverId", authenticate, async (req, res) => {
    try {
      const serverId = parseInt(req.params.serverId);
      const settings = req.body;
      
      const updatedSettings = await storage.createOrUpdateBotSettings(serverId, settings);
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bot settings" });
    }
  });

  // Dashboard stats
  api.get("/dashboard/stats", async (req, res) => {
    try {
      const salesStats = await storage.getSalesStats();
      const users = await storage.listUsers();
      const products = await storage.listProducts();
      const servers = await storage.listServers();
      
      res.json({
        sales: {
          total: salesStats.totalSales,
          amount: salesStats.totalAmount,
          weeklyGrowth: 12  // In a real app, this would be calculated
        },
        clients: {
          total: users.length,
          newToday: 5  // In a real app, this would be calculated
        },
        products: {
          total: products.length,
          active: products.filter(p => p.isActive).length
        },
        servers: {
          total: servers.length,
          limit: 20  // Example limit based on plan
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });

  // Register API routes
  app.use("/api", api);

  return httpServer;
}
