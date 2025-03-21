import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import SubscriptionTier from '@/components/ui/subscription-tier';
import { SubscriptionTier as SubscriptionTierType } from '@shared/schema';

const Subscriptions: React.FC = () => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [newTier, setNewTier] = useState({
    name: '',
    price: '',
    description: '',
    level: '1',
    color: '#3498db',
    maxSales: '',
    maxServers: '',
    features: ['']
  });
  
  // Fetch subscription tiers
  const { data: tiers, isLoading } = useQuery({
    queryKey: ['/api/subscription-tiers'],
    staleTime: 300000, // 5 minutes
  });
  
  // Create new subscription tier
  const createTierMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/subscription-tiers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-tiers'] });
      setDialogOpen(false);
      setNewTier({
        name: '',
        price: '',
        description: '',
        level: '1',
        color: '#3498db',
        maxSales: '',
        maxServers: '',
        features: ['']
      });
      toast({
        title: "Plano criado",
        description: "O plano de assinatura foi criado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar plano",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...newTier.features];
    updatedFeatures[index] = value;
    setNewTier({ ...newTier, features: updatedFeatures });
  };
  
  const addFeature = () => {
    setNewTier({ ...newTier, features: [...newTier.features, ''] });
  };
  
  const removeFeature = (index: number) => {
    const updatedFeatures = [...newTier.features];
    updatedFeatures.splice(index, 1);
    setNewTier({ ...newTier, features: updatedFeatures });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty features
    const features = newTier.features.filter(feature => feature.trim() !== '');
    
    // Convert price from BRL format to cents
    const priceValue = parseFloat(newTier.price.replace(/[^\d,]/g, '').replace(',', '.'));
    const priceInCents = Math.round(priceValue * 100);
    
    createTierMutation.mutate({
      name: newTier.name,
      price: priceInCents,
      description: newTier.description,
      level: parseInt(newTier.level),
      color: newTier.color,
      maxSales: newTier.maxSales ? parseInt(newTier.maxSales) : null,
      maxServers: newTier.maxServers ? parseInt(newTier.maxServers) : null,
      features
    });
  };
  
  // Format price to BRL
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };
  
  // Get the count of subscribers by tier level (mock data for this implementation)
  const getSubscriberCount = (level: number) => {
    const counts = { 1: 21, 2: 35, 3: 14 };
    return counts[level as keyof typeof counts] || 0;
  };
  
  return (
    <>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Planos de Assinatura</h1>
          <p className="text-discord-muted mt-1">Gerencie os planos de assinatura para seus usuários</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-discord-primary hover:bg-opacity-80">
              <i className="fas fa-plus mr-2"></i> Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-discord-card border-discord-dark text-discord-light max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Adicionar Novo Plano</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-discord-light">Nome do Plano</Label>
                  <Input 
                    id="name"
                    value={newTier.name}
                    onChange={(e) => setNewTier({...newTier, name: e.target.value})}
                    className="bg-discord-dark border-discord-sidebar text-discord-light"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-discord-light">Preço Mensal (R$)</Label>
                  <Input 
                    id="price"
                    type="text"
                    value={newTier.price}
                    onChange={(e) => setNewTier({...newTier, price: e.target.value})}
                    className="bg-discord-dark border-discord-sidebar text-discord-light"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-discord-light">Descrição</Label>
                <Textarea 
                  id="description"
                  value={newTier.description}
                  onChange={(e) => setNewTier({...newTier, description: e.target.value})}
                  className="bg-discord-dark border-discord-sidebar text-discord-light"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level" className="text-discord-light">Nível do Plano</Label>
                  <select
                    id="level"
                    value={newTier.level}
                    onChange={(e) => setNewTier({...newTier, level: e.target.value})}
                    className="w-full px-3 py-2 bg-discord-dark border border-discord-sidebar rounded-md text-discord-light"
                    required
                  >
                    <option value="1">Básico (Nível 1)</option>
                    <option value="2">Pro (Nível 2)</option>
                    <option value="3">Premium (Nível 3)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-sales" className="text-discord-light">Limite de Vendas</Label>
                  <Input 
                    id="max-sales"
                    type="number"
                    value={newTier.maxSales}
                    onChange={(e) => setNewTier({...newTier, maxSales: e.target.value})}
                    className="bg-discord-dark border-discord-sidebar text-discord-light"
                    placeholder="Deixe em branco para ilimitado"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-servers" className="text-discord-light">Limite de Servidores</Label>
                  <Input 
                    id="max-servers"
                    type="number"
                    value={newTier.maxServers}
                    onChange={(e) => setNewTier({...newTier, maxServers: e.target.value})}
                    className="bg-discord-dark border-discord-sidebar text-discord-light"
                    placeholder="Deixe em branco para ilimitado"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color" className="text-discord-light">Cor do Plano</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    id="color"
                    type="color"
                    value={newTier.color}
                    onChange={(e) => setNewTier({...newTier, color: e.target.value})}
                    className="w-12 h-10 p-1 bg-discord-dark border-discord-sidebar"
                  />
                  <Input 
                    value={newTier.color}
                    onChange={(e) => setNewTier({...newTier, color: e.target.value})}
                    className="bg-discord-dark border-discord-sidebar text-discord-light"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-discord-light">Recursos do Plano</Label>
                {newTier.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input 
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="bg-discord-dark border-discord-sidebar text-discord-light"
                      placeholder="Ex: Acesso a todos os comandos de vendas"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => removeFeature(index)}
                      className="text-discord-error hover:bg-discord-dark"
                      disabled={newTier.features.length <= 1}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addFeature}
                  className="mt-2 bg-discord-dark border-discord-sidebar text-discord-light hover:bg-discord-sidebar"
                >
                  <i className="fas fa-plus mr-2"></i> Adicionar Recurso
                </Button>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="mr-2 bg-discord-dark border-discord-sidebar text-discord-light hover:bg-discord-sidebar"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-discord-primary hover:bg-opacity-80"
                  disabled={createTierMutation.isPending}
                >
                  {createTierMutation.isPending ? 'Salvando...' : 'Salvar Plano'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>
      
      {/* Subscription Plans Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          // Skeleton loading for subscription tiers
          Array(3).fill(null).map((_, i) => (
            <div key={i} className="bg-discord-card rounded-lg shadow-md p-4 animate-pulse">
              <div className="h-8 bg-discord-dark rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-discord-dark rounded w-1/3 mb-6"></div>
              <div className="space-y-2">
                <div className="h-3 bg-discord-dark rounded"></div>
                <div className="h-3 bg-discord-dark rounded"></div>
                <div className="h-3 bg-discord-dark rounded"></div>
                <div className="h-3 bg-discord-dark rounded"></div>
              </div>
            </div>
          ))
        ) : tiers?.length > 0 ? (
          tiers.map((tier: SubscriptionTierType) => (
            <div key={tier.id} className="bg-discord-card rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-discord-dark flex justify-between items-center">
                <h2 className="text-white font-bold font-heading">{tier.name}</h2>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-discord-primary hover:bg-discord-dark"
                    onClick={() => {
                      // Edit tier functionality
                      toast({
                        title: "Editar plano",
                        description: "Funcionalidade em implementação",
                      });
                    }}
                  >
                    <i className="fas fa-edit"></i>
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <SubscriptionTier 
                  name={tier.name}
                  price={formatPrice(tier.price)}
                  features={tier.features || []}
                  isPopular={tier.level === 2}
                  color={tier.color}
                  subscribers={getSubscriberCount(tier.level)}
                  hasBorder={tier.level === 2}
                />
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-discord-dark rounded p-3">
                    <p className="text-xs text-discord-muted">Nível</p>
                    <p className="text-sm text-discord-light font-medium">
                      {tier.level === 1 ? 'Básico' : tier.level === 2 ? 'Pro' : 'Premium'}
                    </p>
                  </div>
                  <div className="bg-discord-dark rounded p-3">
                    <p className="text-xs text-discord-muted">Vendas</p>
                    <p className="text-sm text-discord-light font-medium">
                      {tier.maxSales ? `Até ${tier.maxSales}` : 'Ilimitadas'}
                    </p>
                  </div>
                  <div className="bg-discord-dark rounded p-3">
                    <p className="text-xs text-discord-muted">Servidores</p>
                    <p className="text-sm text-discord-light font-medium">
                      {tier.maxServers ? `Até ${tier.maxServers}` : 'Ilimitados'}
                    </p>
                  </div>
                  <div className="bg-discord-dark rounded p-3">
                    <p className="text-xs text-discord-muted">Assinantes</p>
                    <p className="text-sm text-discord-light font-medium">
                      {getSubscriberCount(tier.level)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-discord-muted py-12 bg-discord-card rounded-lg shadow-md">
            <i className="fas fa-ticket-alt text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-white mb-2">Nenhum plano encontrado</h3>
            <p>Clique no botão "Novo Plano" para criar seu primeiro plano de assinatura.</p>
          </div>
        )}
      </div>
      
      {/* Server Subscriptions */}
      <div className="bg-discord-card rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-discord-dark">
          <h2 className="text-white font-bold font-heading">Servidores com Assinatura Ativa</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-discord-dark">
            <thead className="bg-discord-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Servidor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Plano</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Início</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Vencimento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-discord-card divide-y divide-discord-dark">
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-discord-muted">
                  <i className="fas fa-server text-4xl mb-4"></i>
                  <h3 className="text-lg font-medium text-white mb-2">Nenhuma assinatura ativa</h3>
                  <p>Os servidores com assinaturas ativas aparecerão aqui.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Subscriptions;
