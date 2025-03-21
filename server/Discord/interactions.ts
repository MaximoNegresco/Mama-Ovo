import { Interaction, ButtonInteraction, SelectMenuInteraction } from 'discord.js';
import { storage } from '../storage';
import { checkSubscriptionAccess } from './commands';

// Helper function to handle button interactions
async function handleButtonInteraction(interaction: ButtonInteraction) {
  // Extract the custom ID which contains information about the action
  const [action, ...params] = interaction.customId.split(':');

  if (action === 'buy') {
    const productId = params[0];
    
    // In a real implementation, this would start a purchase flow
    await interaction.reply({
      content: `Iniciando a compra do produto ID #${productId}...`,
      ephemeral: true
    });
    
    // This would be followed by a more complex flow with payment integration
  } else if (action === 'info') {
    const productId = params[0];
    
    // In a real implementation, this would show product details
    await interaction.reply({
      content: `Mostrando informações do produto ID #${productId}...`,
      ephemeral: true
    });
  } else if (action === 'cancel_sale') {
    const saleId = params[0];
    
    // In a real implementation, this would cancel a sale
    await interaction.reply({
      content: `Cancelando a venda ID #${saleId}...`,
      ephemeral: true
    });
  } else if (action === 'confirm_sale') {
    const saleId = params[0];
    
    // In a real implementation, this would confirm a sale
    await interaction.reply({
      content: `Confirmando a venda ID #${saleId}...`,
      ephemeral: true
    });
  } else {
    await interaction.reply({
      content: 'Ação desconhecida.',
      ephemeral: true
    });
  }
}

// Helper function to handle select menu interactions
async function handleSelectMenuInteraction(interaction: SelectMenuInteraction) {
  const [action, ...params] = interaction.customId.split(':');
  const selected = interaction.values[0];

  if (action === 'product_category') {
    // In a real implementation, this would filter products by category
    await interaction.reply({
      content: `Mostrando produtos da categoria: ${selected}`,
      ephemeral: true
    });
  } else if (action === 'subscription_tier') {
    // In a real implementation, this would show subscription tier details or start a subscription flow
    await interaction.reply({
      content: `Selecionado o plano: ${selected}`,
      ephemeral: true
    });
  } else {
    await interaction.reply({
      content: 'Ação desconhecida.',
      ephemeral: true
    });
  }
}

// Main interaction handler
export async function handleInteraction(interaction: Interaction) {
  try {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`Command ${interaction.commandName} not found.`);
        return;
      }

      // Check if the user has the required subscription level
      const hasAccess = await checkSubscriptionAccess(interaction, command.minSubscriptionLevel);
      
      if (!hasAccess) {
        return interaction.reply({
          content: `❌ Seu servidor precisa ter um plano de assinatura apropriado para usar este comando.`,
          ephemeral: true
        });
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({ 
            content: 'Ocorreu um erro ao executar este comando.' 
          });
        } else {
          await interaction.reply({ 
            content: 'Ocorreu um erro ao executar este comando.', 
            ephemeral: true 
          });
        }
      }
    }
    // Handle buttons
    else if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    }
    // Handle select menus
    else if (interaction.isSelectMenu()) {
      await handleSelectMenuInteraction(interaction);
    }
    // Handle other interaction types if needed
  } catch (error) {
    console.error('Error handling interaction:', error);
  }
}
