import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  discordUserId: text("discord_user_id").unique(),
  avatarUrl: text("avatar_url"),
  isAdmin: boolean("is_admin").default(false),
});

export const servers = pgTable("servers", {
  id: serial("id").primaryKey(),
  discordServerId: text("discord_server_id").notNull().unique(),
  name: text("name").notNull(),
  iconUrl: text("icon_url"),
  ownerId: integer("owner_id").references(() => users.id),
  premiumTier: integer("premium_tier").default(0),
  prefix: text("prefix").default("!"),
  isActive: boolean("is_active").default(true),
});

export const subscriptionTiers = pgTable("subscription_tiers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(), // stored in cents
  description: text("description"),
  features: text("features").array(),
  level: integer("level").notNull(), // 1=Basic, 2=Pro, 3=Premium
  color: text("color").default("#7289DA"),
  maxSales: integer("max_sales"),
  maxServers: integer("max_servers"),
});

export const commands = pgTable("commands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  usage: text("usage"),
  category: text("category"),
  minSubscriptionLevel: integer("min_subscription_level").default(1),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  icon: text("icon").default("fas fa-robot"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // stored in cents
  serverId: integer("server_id").references(() => servers.id),
  isActive: boolean("is_active").default(true),
  stock: integer("stock"),
  imageUrl: text("image_url"),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  clientId: integer("client_id").references(() => users.id),
  serverId: integer("server_id").references(() => servers.id),
  price: integer("price").notNull(), // stored in cents
  status: text("status").default("pending"), // pending, paid, cancelled
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serverSubscriptions = pgTable("server_subscriptions", {
  id: serial("id").primaryKey(),
  serverId: integer("server_id").references(() => servers.id),
  tierId: integer("tier_id").references(() => subscriptionTiers.id),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
});

export const botSettings = pgTable("bot_settings", {
  id: serial("id").primaryKey(),
  serverId: integer("server_id").references(() => servers.id),
  settings: jsonb("settings"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertServerSchema = createInsertSchema(servers).omit({ id: true });
export const insertSubscriptionTierSchema = createInsertSchema(subscriptionTiers).omit({ id: true });
export const insertCommandSchema = createInsertSchema(commands).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertSaleSchema = createInsertSchema(sales).omit({ id: true, createdAt: true });
export const insertServerSubscriptionSchema = createInsertSchema(serverSubscriptions).omit({ id: true, startDate: true });
export const insertBotSettingsSchema = createInsertSchema(botSettings).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Server = typeof servers.$inferSelect;
export type InsertServer = z.infer<typeof insertServerSchema>;

export type SubscriptionTier = typeof subscriptionTiers.$inferSelect;
export type InsertSubscriptionTier = z.infer<typeof insertSubscriptionTierSchema>;

export type Command = typeof commands.$inferSelect;
export type InsertCommand = z.infer<typeof insertCommandSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

export type ServerSubscription = typeof serverSubscriptions.$inferSelect;
export type InsertServerSubscription = z.infer<typeof insertServerSubscriptionSchema>;

export type BotSettings = typeof botSettings.$inferSelect;
export type InsertBotSettings = z.infer<typeof insertBotSettingsSchema>;
