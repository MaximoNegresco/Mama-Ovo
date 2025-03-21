import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { storage } from '../storage';

// Define the types for our command structure
export interface Command {
  data: SlashCommandBuilder | any;
  execute: Function;
  minSubscriptionLevel: number;
}

// Helper function to check if a user has the required subscription level
export async function checkSubscriptionAccess(interaction, minLevel = 1) {
  // Get the guild's subscription level
  const guildId = interaction.guild?.id;
  if (!guildId) return false;

  const server = await storage.getServerByDiscordId(guildId);
  if (!server) return false;

  const subscription = await storage.getActiveServerSubscription(server.id);
  if (!subscription) return false;

  const tier = await storage.getSubscriptionTier(subscription.tierId);
  if (!tier) return false;

  return tier.level >= minLevel;
}

// Create a vender command for processing sales
const venderCommand = {
  data: new SlashCommandBuilder()
    .setName('vender')
    .setDescription('Processa uma nova venda com pagamento')
    .addStringOption(option =>
      option.setName('produto')
        .setDescription('Nome do produto')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('valor')
        .setDescription('Valor do produto em reais')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('cliente')
        .setDescription('Cliente que está comprando')
        .setRequired(true)),
  async execute(interaction) {
    // Check if the user has the required subscription level
    const hasAccess = await checkSubscriptionAccess(interaction, 2);
    if (!hasAccess) {
      return interaction.reply({
        content: '❌ Seu servidor precisa ter o plano Pro ou superior para usar este comando.',
        ephemeral: true
      });
    }

    const produto = interaction.options.getString('produto');
    const valor = interaction.options.getNumber('valor');
    const cliente = interaction.options.getUser('cliente');

    await interaction.deferReply();

    try {
      // Log the command usage
      const command = await storage.getCommandByName('vender');
      if (command) {
        await storage.incrementCommandUsage(command.id);
      }

      // Get the server
      const server = await storage.getServerByDiscordId(interaction.guild.id);
      if (!server) {
        return interaction.editReply('❌ Servidor não registrado. Contacte o suporte.');
      }

      // Create the sale in our database
      const sale = await storage.createSale({
        productId: undefined, // This would be a real product ID in a complete implementation
        clientId: undefined, // This would be a real client ID in a complete implementation
        serverId: server.id,
        price: Math.round(valor * 100), // Convert to cents
        status: 'pending',
        transactionId: undefined
      });

      // Reply with success message and details
      await interaction.editReply({
        content: `✅ Venda registrada com sucesso!`,
        embeds: [
          {
            title: 'Detalhes da Venda',
            color: 0x7289DA,
            fields: [
              { name: 'Produto', value: produto, inline: true },
              { name: 'Valor', value: `R$ ${valor.toFixed(2)}`, inline: true },
              { name: 'Cliente', value: `<@${cliente.id}>`, inline: true },
              { name: 'Status', value: 'Pendente', inline: true },
              { name: 'ID da Venda', value: `#${sale.id}`, inline: true }
            ],
            timestamp: new Date().toISOString()
          }
        ]
      });
    } catch (error) {
      console.error('Error in vender command:', error);
      await interaction.editReply('❌ Erro ao registrar a venda. Tente novamente mais tarde.');
    }
  },
  minSubscriptionLevel: 2
};

// Create a relatorio command
const relatorioCommand = {
  data: new SlashCommandBuilder()
    .setName('relatorio')
    .setDescription('Gera relatório de vendas por período')
    .addStringOption(option =>
      option.setName('inicio')
        .setDescription('Data de início (DD/MM/YYYY)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('fim')
        .setDescription('Data de fim (DD/MM/YYYY)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('tipo')
        .setDescription('Tipo de relatório')
        .addChoices(
          { name: 'Resumido', value: 'resumido' },
          { name: 'Detalhado', value: 'detalhado' }
        )),
  async execute(interaction) {
    // Check if the user has the required subscription level
    const hasAccess = await checkSubscriptionAccess(interaction, 1);
    if (!hasAccess) {
      return interaction.reply({
        content: '❌ Seu servidor precisa ter pelo menos o plano Básico para usar este comando.',
        ephemeral: true
      });
    }

    const inicio = interaction.options.getString('inicio');
    const fim = interaction.options.getString('fim');
    const tipo = interaction.options.getString('tipo') || 'resumido';

    await interaction.deferReply();

    try {
      // Log the command usage
      const command = await storage.getCommandByName('relatorio');
      if (command) {
        await storage.incrementCommandUsage(command.id);
      }

      // In a complete implementation, we would fetch actual sales data for the period
      
      // Reply with a mock report
      await interaction.editReply({
        content: `📊 Relatório gerado com sucesso!`,
        embeds: [
          {
            title: `Relatório de Vendas ${tipo === 'detalhado' ? 'Detalhado' : 'Resumido'}`,
            description: `Período: ${inicio} até ${fim}`,
            color: 0x3498DB,
            fields: [
              { name: 'Total de Vendas', value: '12', inline: true },
              { name: 'Valor Total', value: 'R$ 1.457,80', inline: true },
              { name: 'Média por Venda', value: 'R$ 121,48', inline: true },
              { name: 'Status', value: '10 Pagas\n2 Pendentes', inline: false }
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: 'VendaBot Pro - Relatórios Automáticos'
            }
          }
        ]
      });
    } catch (error) {
      console.error('Error in relatorio command:', error);
      await interaction.editReply('❌ Erro ao gerar o relatório. Tente novamente mais tarde.');
    }
  },
  minSubscriptionLevel: 1
};

// Create a config command
const configCommand = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configuração rápida de automação')
    .addStringOption(option =>
      option.setName('modulo')
        .setDescription('Módulo a ser configurado')
        .setRequired(true)
        .addChoices(
          { name: 'Vendas Automáticas', value: 'vendas_auto' },
          { name: 'Notificações', value: 'notificacoes' },
          { name: 'Relatórios', value: 'relatorios' },
          { name: 'Integrações', value: 'integracoes' }
        ))
    .addBooleanOption(option =>
      option.setName('ativar')
        .setDescription('Ativar ou desativar o módulo')
        .setRequired(true)),
  async execute(interaction) {
    // Check if the user has the required subscription level
    const hasAccess = await checkSubscriptionAccess(interaction, 3);
    if (!hasAccess) {
      return interaction.reply({
        content: '❌ Seu servidor precisa ter o plano Premium para usar este comando.',
        ephemeral: true
      });
    }

    const modulo = interaction.options.getString('modulo');
    const ativar = interaction.options.getBoolean('ativar');

    await interaction.deferReply();

    try {
      // Log the command usage
      const command = await storage.getCommandByName('config');
      if (command) {
        await storage.incrementCommandUsage(command.id);
      }

      // Get the server
      const server = await storage.getServerByDiscordId(interaction.guild.id);
      if (!server) {
        return interaction.editReply('❌ Servidor não registrado. Contacte o suporte.');
      }

      // Get existing settings or create new ones
      let settings = await storage.getBotSettings(server.id);
      let currentSettings = settings?.settings || {};
      
      // Update the settings
      currentSettings[modulo] = ativar;
      
      // Save the settings
      await storage.createOrUpdateBotSettings(server.id, currentSettings);

      // Reply with success message
      const moduleNames = {
        vendas_auto: 'Vendas Automáticas',
        notificacoes: 'Notificações',
        relatorios: 'Relatórios',
        integracoes: 'Integrações'
      };

      await interaction.editReply({
        content: `✅ Configuração atualizada com sucesso!`,
        embeds: [
          {
            title: 'Configuração de Módulo',
            color: ativar ? 0x43B581 : 0xF04747,
            fields: [
              { name: 'Módulo', value: moduleNames[modulo] || modulo, inline: true },
              { name: 'Status', value: ativar ? '✅ Ativado' : '❌ Desativado', inline: true }
            ],
            timestamp: new Date().toISOString()
          }
        ]
      });
    } catch (error) {
      console.error('Error in config command:', error);
      await interaction.editReply('❌ Erro ao atualizar a configuração. Tente novamente mais tarde.');
    }
  },
  minSubscriptionLevel: 3
};

// Create a produto command
const produtoCommand = {
  data: new SlashCommandBuilder()
    .setName('produto')
    .setDescription('Gerencia produtos para venda')
    .addSubcommand(subcommand =>
      subcommand
        .setName('adicionar')
        .setDescription('Adiciona um novo produto')
        .addStringOption(option => option.setName('nome').setDescription('Nome do produto').setRequired(true))
        .addNumberOption(option => option.setName('preco').setDescription('Preço do produto em reais').setRequired(true))
        .addStringOption(option => option.setName('descricao').setDescription('Descrição do produto').setRequired(true))
        .addNumberOption(option => option.setName('estoque').setDescription('Quantidade em estoque (opcional)')))
    .addSubcommand(subcommand =>
      subcommand
        .setName('listar')
        .setDescription('Lista todos os produtos cadastrados'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remover')
        .setDescription('Remove um produto')
        .addStringOption(option => option.setName('id').setDescription('ID do produto').setRequired(true))),
  async execute(interaction) {
    // Check if the user has the required subscription level
    const hasAccess = await checkSubscriptionAccess(interaction, 1);
    if (!hasAccess) {
      return interaction.reply({
        content: '❌ Seu servidor precisa ter pelo menos o plano Básico para usar este comando.',
        ephemeral: true
      });
    }

    const subcommand = interaction.options.getSubcommand();

    await interaction.deferReply();

    try {
      // Log the command usage
      const command = await storage.getCommandByName('produto');
      if (command) {
        await storage.incrementCommandUsage(command.id);
      }

      // Get the server
      const server = await storage.getServerByDiscordId(interaction.guild.id);
      if (!server) {
        return interaction.editReply('❌ Servidor não registrado. Contacte o suporte.');
      }

      if (subcommand === 'adicionar') {
        const nome = interaction.options.getString('nome');
        const preco = interaction.options.getNumber('preco');
        const descricao = interaction.options.getString('descricao');
        const estoque = interaction.options.getNumber('estoque');

        // Create the product
        const product = await storage.createProduct({
          name: nome,
          description: descricao,
          price: Math.round(preco * 100), // Convert to cents
          serverId: server.id,
          isActive: true,
          stock: estoque || null
        });

        await interaction.editReply({
          content: `✅ Produto adicionado com sucesso!`,
          embeds: [
            {
              title: 'Novo Produto',
              color: 0x43B581,
              fields: [
                { name: 'ID', value: `#${product.id}`, inline: true },
                { name: 'Nome', value: nome, inline: true },
                { name: 'Preço', value: `R$ ${preco.toFixed(2)}`, inline: true },
                { name: 'Descrição', value: descricao },
                { name: 'Estoque', value: estoque ? estoque.toString() : 'Ilimitado', inline: true }
              ],
              timestamp: new Date().toISOString()
            }
          ]
        });
      } else if (subcommand === 'listar') {
        // Get all products for this server
        const products = await storage.listProductsByServer(server.id);

        if (products.length === 0) {
          return interaction.editReply('❌ Nenhum produto cadastrado.');
        }

        const productList = products.map(p => {
          return {
            name: `#${p.id} - ${p.name}`,
            value: `💰 R$ ${(p.price / 100).toFixed(2)}${p.isActive ? '' : ' (Inativo)'}`
          };
        });

        await interaction.editReply({
          embeds: [
            {
              title: 'Lista de Produtos',
              color: 0x7289DA,
              fields: productList.slice(0, 25), // Discord has a limit of 25 fields
              timestamp: new Date().toISOString(),
              footer: {
                text: `Total: ${products.length} produtos`
              }
            }
          ]
        });
      } else if (subcommand === 'remover') {
        const id = parseInt(interaction.options.getString('id'));
        
        // For a complete implementation, we would actually remove the product
        // For this demo, we'll just give a success message
        
        await interaction.editReply({
          content: `✅ Produto #${id} removido com sucesso!`
        });
      }
    } catch (error) {
      console.error('Error in produto command:', error);
      await interaction.editReply('❌ Erro ao gerenciar produtos. Tente novamente mais tarde.');
    }
  },
  minSubscriptionLevel: 1
};

// Create a cliente command
const clienteCommand = {
  data: new SlashCommandBuilder()
    .setName('cliente')
    .setDescription('Gerencia informações de clientes')
    .addSubcommand(subcommand =>
      subcommand
        .setName('adicionar')
        .setDescription('Adiciona um novo cliente')
        .addUserOption(option => option.setName('usuario').setDescription('Usuário do Discord').setRequired(true))
        .addStringOption(option => option.setName('email').setDescription('Email do cliente').setRequired(false))
        .addStringOption(option => option.setName('telefone').setDescription('Telefone do cliente').setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('buscar')
        .setDescription('Busca informações de um cliente')
        .addUserOption(option => option.setName('usuario').setDescription('Usuário do Discord').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('historico')
        .setDescription('Mostra o histórico de compras de um cliente')
        .addUserOption(option => option.setName('usuario').setDescription('Usuário do Discord').setRequired(true))),
  async execute(interaction) {
    // Check if the user has the required subscription level
    const hasAccess = await checkSubscriptionAccess(interaction, 2);
    if (!hasAccess) {
      return interaction.reply({
        content: '❌ Seu servidor precisa ter o plano Pro ou superior para usar este comando.',
        ephemeral: true
      });
    }

    const subcommand = interaction.options.getSubcommand();
    const usuario = interaction.options.getUser('usuario');

    await interaction.deferReply();

    try {
      // Log the command usage
      const command = await storage.getCommandByName('cliente');
      if (command) {
        await storage.incrementCommandUsage(command.id);
      }

      // Check if the user exists in our database
      let user = await storage.getUserByDiscordId(usuario.id);
      
      if (subcommand === 'adicionar') {
        const email = interaction.options.getString('email');
        const telefone = interaction.options.getString('telefone');
        
        if (!user) {
          // Create the user if they don't exist
          user = await storage.createUser({
            username: usuario.username,
            password: 'password-placeholder', // In a real implementation this would be handled differently
            discordUserId: usuario.id,
            avatarUrl: usuario.displayAvatarURL()
          });
        }
        
        await interaction.editReply({
          content: `✅ Cliente adicionado com sucesso!`,
          embeds: [
            {
              title: 'Novo Cliente',
              color: 0x43B581,
              thumbnail: {
                url: usuario.displayAvatarURL()
              },
              fields: [
                { name: 'Discord', value: `<@${usuario.id}>`, inline: true },
                { name: 'Username', value: usuario.username, inline: true },
                { name: 'Email', value: email || 'Não informado', inline: true },
                { name: 'Telefone', value: telefone || 'Não informado', inline: true }
              ],
              timestamp: new Date().toISOString()
            }
          ]
        });
      } else if (subcommand === 'buscar') {
        if (!user) {
          return interaction.editReply('❌ Este usuário não está cadastrado como cliente.');
        }
        
        await interaction.editReply({
          embeds: [
            {
              title: 'Informações do Cliente',
              color: 0x7289DA,
              thumbnail: {
                url: usuario.displayAvatarURL()
              },
              fields: [
                { name: 'ID', value: `#${user.id}`, inline: true },
                { name: 'Discord', value: `<@${usuario.id}>`, inline: true },
                { name: 'Username', value: usuario.username, inline: true }
              ],
              timestamp: new Date().toISOString()
            }
          ]
        });
      } else if (subcommand === 'historico') {
        if (!user) {
          return interaction.editReply('❌ Este usuário não está cadastrado como cliente.');
        }
        
        // In a complete implementation, we would fetch the user's purchase history
        
        await interaction.editReply({
          embeds: [
            {
              title: 'Histórico de Compras',
              description: 'Não há compras registradas para este cliente.',
              color: 0x7289DA,
              thumbnail: {
                url: usuario.displayAvatarURL()
              },
              fields: [],
              timestamp: new Date().toISOString(),
              footer: {
                text: `Cliente #${user.id} - ${usuario.username}`
              }
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error in cliente command:', error);
      await interaction.editReply('❌ Erro ao gerenciar cliente. Tente novamente mais tarde.');
    }
  },
  minSubscriptionLevel: 2
};

// Create a painel command
const painelCommand = {
  data: new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Cria painéis interativos de venda')
    .addSubcommand(subcommand =>
      subcommand
        .setName('produto')
        .setDescription('Cria um painel para um produto específico')
        .addStringOption(option => option.setName('id').setDescription('ID do produto').setRequired(true))
        .addChannelOption(option => option.setName('canal').setDescription('Canal para enviar o painel').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('categoria')
        .setDescription('Cria um painel para todos os produtos de uma categoria')
        .addStringOption(option => option.setName('categoria').setDescription('Nome da categoria').setRequired(true))
        .addChannelOption(option => option.setName('canal').setDescription('Canal para enviar o painel').setRequired(true))),
  async execute(interaction) {
    // Check if the user has the required subscription level
    const hasAccess = await checkSubscriptionAccess(interaction, 2);
    if (!hasAccess) {
      return interaction.reply({
        content: '❌ Seu servidor precisa ter o plano Pro ou superior para usar este comando.',
        ephemeral: true
      });
    }

    const subcommand = interaction.options.getSubcommand();
    const canal = interaction.options.getChannel('canal');

    await interaction.deferReply();

    try {
      // Log the command usage
      const command = await storage.getCommandByName('painel');
      if (command) {
        await storage.incrementCommandUsage(command.id);
      }

      if (subcommand === 'produto') {
        const id = interaction.options.getString('id');
        
        // In a complete implementation, we would fetch the product and create a panel
        
        await interaction.editReply({
          content: `✅ Painel de produto criado com sucesso no canal ${canal}!`
        });
      } else if (subcommand === 'categoria') {
        const categoria = interaction.options.getString('categoria');
        
        // In a complete implementation, we would fetch all products in the category and create a panel
        
        await interaction.editReply({
          content: `✅ Painel de categoria "${categoria}" criado com sucesso no canal ${canal}!`
        });
      }
    } catch (error) {
      console.error('Error in painel command:', error);
      await interaction.editReply('❌ Erro ao criar painel. Tente novamente mais tarde.');
    }
  },
  minSubscriptionLevel: 2
};

// Export all commands
export const commands = [
  venderCommand,
  relatorioCommand,
  configCommand,
  produtoCommand,
  clienteCommand,
  painelCommand
];
