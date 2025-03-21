import { REST, Routes } from 'discord.js';
import { commands } from './commands';

// This script is used to register slash commands with Discord
export async function deployCommands() {
  if (!process.env.DISCORD_BOT_TOKEN) {
    throw new Error('DISCORD_BOT_TOKEN is not set in environment variables');
  }

  if (!process.env.DISCORD_CLIENT_ID) {
    throw new Error('DISCORD_CLIENT_ID is not set in environment variables');
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');

    // The commands array contains all our command builders
    const commandData = commands.map(command => command.data.toJSON());

    // If a guild ID is provided, register commands for that guild only (faster for dev)
    if (process.env.DISCORD_GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.DISCORD_CLIENT_ID,
          process.env.DISCORD_GUILD_ID
        ),
        { body: commandData }
      );
      console.log(`Successfully registered guild commands for guild ${process.env.DISCORD_GUILD_ID}`);
    } else {
      // Otherwise, register global commands (takes up to an hour to propagate)
      await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
        { body: commandData }
      );
      console.log('Successfully registered global application commands.');
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Run the deploy function if this file is called directly
if (require.main === module) {
  deployCommands()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
