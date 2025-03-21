import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CommandCard from '@/components/ui/command-card';
import { DEFAULT_PAGINATION_LIMIT, SUBSCRIPTION_LEVEL_NAMES } from '@/lib/constants';
import { CommandsFilter, EnhancedCommand } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Commands: React.FC = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<CommandsFilter>({
    page: 1,
    limit: DEFAULT_PAGINATION_LIMIT
  });
  
  // Fetch commands
  const { data: commands, isLoading } = useQuery({
    queryKey: ['/api/commands', filter],
    staleTime: 300000, // 5 minutes
  });
  
  // Get subscription level name
  const getSubscriptionLevelName = (level: number) => {
    return SUBSCRIPTION_LEVEL_NAMES[level] || 'Desconhecido';
  };
  
  // Group commands by category
  const groupedCommands = commands ? commands.reduce((acc: { [key: string]: EnhancedCommand[] }, cmd: EnhancedCommand) => {
    const category = cmd.category || 'outros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(cmd);
    return acc;
  }, {}) : {};
  
  // Get all categories
  const categories = commands ? [...new Set(commands.map((cmd: EnhancedCommand) => cmd.category || 'outros'))] : [];
  
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white font-heading">Comandos Slash</h1>
        <p className="text-discord-muted mt-1">Gerencie e explore os comandos slash disponíveis para seu bot</p>
      </header>
      
      {/* Filters */}
      <div className="bg-discord-card rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search-command" className="text-discord-light text-sm mb-1 block">Buscar comando</Label>
            <Input 
              id="search-command"
              placeholder="Nome do comando"
              className="bg-discord-dark border-discord-sidebar text-discord-light"
              onChange={(e) => setFilter({...filter, search: e.target.value || undefined})}
            />
          </div>
          
          <div className="w-full md:w-1/4">
            <Label htmlFor="filter-category" className="text-discord-light text-sm mb-1 block">Categoria</Label>
            <select
              id="filter-category"
              className="w-full px-3 py-2 bg-discord-dark border border-discord-sidebar rounded-md text-discord-light"
              onChange={(e) => setFilter({...filter, category: e.target.value || undefined})}
            >
              <option value="">Todas as categorias</option>
              {categories.map((category: string) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-1/4">
            <Label htmlFor="filter-level" className="text-discord-light text-sm mb-1 block">Nível mínimo</Label>
            <select
              id="filter-level"
              className="w-full px-3 py-2 bg-discord-dark border border-discord-sidebar rounded-md text-discord-light"
              onChange={(e) => setFilter({...filter, minSubscriptionLevel: e.target.value ? parseInt(e.target.value) : undefined})}
            >
              <option value="">Todos os níveis</option>
              <option value="1">Básico</option>
              <option value="2">Pro</option>
              <option value="3">Premium</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Commands Panel */}
      <div className="bg-discord-card rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-discord-dark">
          <h2 className="text-white font-bold font-heading">Lista de Comandos</h2>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            // Skeleton loading for commands
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(null).map((_, i) => (
                <div key={i} className="bg-discord-dark rounded-md p-4 animate-pulse">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-discord-bg"></div>
                    <div className="ml-3 w-full">
                      <div className="h-5 bg-discord-bg rounded w-1/3 mb-1"></div>
                      <div className="h-3 bg-discord-bg rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="h-6 bg-discord-bg rounded"></div>
                  </div>
                  <div className="mt-3 flex justify-between">
                    <div className="h-3 bg-discord-bg rounded w-1/4"></div>
                    <div className="h-3 bg-discord-bg rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : commands?.length > 0 ? (
            <Tabs defaultValue={categories[0] || 'all'} className="w-full">
              <TabsList className="bg-discord-dark mb-4 w-full overflow-x-auto flex whitespace-nowrap p-1">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-discord-primary data-[state=active]:text-white"
                >
                  Todos
                </TabsTrigger>
                {categories.map((category: string) => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="data-[state=active]:bg-discord-primary data-[state=active]:text-white"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {commands.map((command: EnhancedCommand) => (
                    <CommandCard
                      key={command.id}
                      name={command.name}
                      description={command.description}
                      usage={command.usage || `/${command.name}`}
                      icon={command.icon || "fas fa-cog"}
                      minPlan={`${getSubscriptionLevelName(command.minSubscriptionLevel)}+`}
                      usageCount={command.usageCount}
                    />
                  ))}
                </div>
              </TabsContent>
              
              {categories.map((category: string) => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedCommands[category]?.map((command: EnhancedCommand) => (
                      <CommandCard
                        key={command.id}
                        name={command.name}
                        description={command.description}
                        usage={command.usage || `/${command.name}`}
                        icon={command.icon || "fas fa-cog"}
                        minPlan={`${getSubscriptionLevelName(command.minSubscriptionLevel)}+`}
                        usageCount={command.usageCount}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center text-discord-muted py-12">
              <i className="fas fa-slash text-4xl mb-4"></i>
              <h3 className="text-lg font-medium text-white mb-2">Nenhum comando encontrado</h3>
              <p>Tente ajustar seus filtros de busca.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Bot Commands Instructions */}
      <div className="mt-8 bg-discord-card rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-discord-dark">
          <h2 className="text-white font-bold font-heading">Como Usar os Comandos</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-discord-dark rounded-md p-4">
              <h3 className="text-white font-medium mb-3">
                <i className="fas fa-terminal mr-2 text-discord-primary"></i>
                Comandos Slash
              </h3>
              <p className="text-discord-light text-sm mb-4">
                Nossos comandos utilizam a funcionalidade de Slash Commands do Discord, que facilita o uso com autocompletar e validação.
              </p>
              <div className="bg-discord-sidebar rounded-md p-3 text-discord-light text-sm font-mono">
                /comando [opções]
              </div>
              <div className="mt-4">
                <Button 
                  className="w-full bg-discord-dark hover:bg-discord-hover border border-discord-sidebar"
                  onClick={() => {
                    // Deploy commands help
                    toast({
                      title: "Implementação de comandos",
                      description: "Para ativar os comandos slash no seu servidor, você precisa convidar o bot com as permissões corretas.",
                    });
                  }}
                >
                  <i className="fas fa-question-circle mr-2"></i> Saiba mais
                </Button>
              </div>
            </div>
            
            <div className="bg-discord-dark rounded-md p-4">
              <h3 className="text-white font-medium mb-3">
                <i className="fas fa-lock mr-2 text-discord-warning"></i>
                Níveis de Acesso
              </h3>
              <p className="text-discord-light text-sm mb-4">
                Os comandos possuem requisitos de nível de assinatura, os quais determinam quais servidores podem utilizá-los.
              </p>
              <ul className="space-y-2 text-sm text-discord-light">
                <li className="flex items-center">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="ml-2">Básico - Comandos essenciais</span>
                </li>
                <li className="flex items-center">
                  <div className="w-3 h-3 bg-discord-primary rounded-full"></div>
                  <span className="ml-2">Pro - Automação e recursos avançados</span>
                </li>
                <li className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="ml-2">Premium - Todos os recursos e integrações</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-discord-dark rounded-md">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-discord-primary bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="fas fa-lightbulb text-discord-primary"></i>
              </div>
              <div className="ml-4">
                <h3 className="text-white font-medium">Dica para comandos personalizados</h3>
                <p className="text-sm text-discord-muted mt-1">
                  Use o comando <code className="bg-discord-bg px-1 rounded font-mono">/config</code> para personalizar comportamentos e ativar módulos específicos para o seu servidor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Commands;
