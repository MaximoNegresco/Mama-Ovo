import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';
import { storage } from '../storage';
import { commands } from './commands';
import { handleInteraction } from './interactions';

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

let isInitialized = false;

export async function startBot() {
  if (isInitialized) return client;
  isInitialized = true;

  // Set up commands collection
  client.commands = new Collection();
  
  // Register all commands
  for (const command of commands) {
    client.commands.set(command.data.name, command);
  }

  // Log when the bot is ready
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Discord bot ready! Logged in as ${readyClient.user.tag}`);
    
    // Get all guilds and log them
    const guilds = client.guilds.cache;
    console.log(`Bot is in ${guilds.size} server(s)`);
    
    // Ensure all guilds are registered in our database
    guilds.forEach(async (guild) => {
      const existingServer = await storage.getServerByDiscordId(guild.id);
      
      if (!existingServer) {
        try {
          await storage.createServer({
            discordServerId: guild.id,
            name: guild.name,
            iconUrl: guild.iconURL() || undefined,
            ownerId: undefined, // This would be filled in when the owner logs in
            premiumTier: 0, // Default to free tier
            isActive: true
          });
          console.log(`Registered new guild: ${guild.name} (${guild.id})`);
        } catch (error) {
          console.error(`Failed to register guild ${guild.name}:`, error);
        }
      }
    });
  });

  // Handle interactions (slash commands, buttons, etc.)
  client.on(Events.InteractionCreate, handleInteraction);

  // Login to Discord
  if (!process.env.DISCORD_BOT_TOKEN) {
    throw new Error("DISCORD_BOT_TOKEN is not set in environment variables");
  }
  
  await client.login(process.env.DISCORD_BOT_TOKEN);
  
  // Return the client for other parts of the app to use
  return client;
}

export function getClient() {
  if (!isInitialized) {
    throw new Error("Bot not initialized. Call startBot() first");
  }
  return client;
}
