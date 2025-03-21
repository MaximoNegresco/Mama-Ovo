import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'sales' | 'system' | 'clients';
}

const Notifications: React.FC = () => {
  const { toast } = useToast();
  
  // Mock notification settings (in a complete implementation, this would come from the API)
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'new_sale',
      name: 'Novas Vendas',
      description: 'Receba notificações quando uma nova venda for realizada',
      enabled: true,
      category: 'sales'
    },
    {
      id: 'sale_status',
      name: 'Mudança de Status de Venda',
      description: 'Notificações quando o status de uma venda for alterado',
      enabled: true,
      category: 'sales'
    },
    {
      id: 'daily_summary',
      name: 'Resumo Diário',
      description: 'Resumo diário de vendas e atividades',
      enabled: false,
      category: 'system'
    },
    {
      id: 'bot_status',
      name: 'Status do Bot',
      description: 'Alertas sobre alterações no status do bot (online/offline)',
      enabled: true,
      category: 'system'
    },
    {
      id: 'new_client',
      name: 'Novos Clientes',
      description: 'Notificação quando um novo cliente for registrado',
      enabled: false,
      category: 'clients'
    },
    {
      id: 'subscription_expiry',
      name: 'Expiração de Assinaturas',
      description: 'Avisos sobre assinaturas prestes a expirar',
      enabled: true,
      category: 'sales'
    },
    {
      id: 'low_stock',
      name: 'Estoque Baixo',
      description: 'Alertas quando um produto estiver com estoque baixo',
      enabled: true,
      category: 'sales'
    },
    {
      id: 'weekly_report',
      name: 'Relatório Semanal',
      description: 'Um relatório completo enviado semanalmente',
      enabled: false,
      category: 'system'
    }
  ]);
  
  // List of recent notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Nova Venda',
      message: 'Venda #102 registrada com sucesso.',
      time: '5 minutos atrás',
      read: false,
      type: 'sales'
    },
    {
      id: 2,
      title: 'Status do Bot',
      message: 'O bot foi reiniciado com sucesso.',
      time: '1 hora atrás',
      read: true,
      type: 'system'
    },
    {
      id: 3,
      title: 'Assinatura Expirando',
      message: 'A assinatura do servidor "Comunidade Pro" expira em 3 dias.',
      time: '3 horas atrás',
      read: false,
      type: 'sales'
    },
    {
      id: 4,
      title: 'Novo Cliente',
      message: 'Cliente "Ana Ferreira" registrado via comando.',
      time: 'Ontem, 15:42',
      read: true,
      type: 'clients'
    },
    {
      id: 5,
      title: 'Estoque Baixo',
      message: 'Produto "Curso Discord" está com apenas 2 unidades em estoque.',
      time: 'Ontem, 10:15',
      read: true,
      type: 'sales'
    }
  ]);
  
  // Toggle notification setting
  const handleToggle = (id: string, enabled: boolean) => {
    setSettings(settings.map(setting => 
      setting.id === id ? { ...setting, enabled } : setting
    ));
    
    toast({
      title: "Configuração atualizada",
      description: `Notificações ${enabled ? 'ativadas' : 'desativadas'} com sucesso`,
    });
  };
  
  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    
    toast({
      title: "Notificações",
      description: "Todas as notificações foram marcadas como lidas",
    });
  };
  
  // Filter settings by category
  const filterSettingsByCategory = (category: 'sales' | 'system' | 'clients') => {
    return settings.filter(setting => setting.category === category);
  };
  
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white font-heading">Notificações</h1>
        <p className="text-discord-muted mt-1">Gerencie as notificações e alertas do seu bot de vendas</p>
      </header>
      
      {/* Recent Notifications */}
      <div className="bg-discord-card rounded-lg shadow-md mb-8">
        <div className="px-6 py-4 border-b border-discord-dark flex justify-between items-center">
          <h2 className="text-white font-bold font-heading">Notificações Recentes</h2>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-discord-primary hover:bg-discord-hover"
            onClick={markAllAsRead}
          >
            Marcar todas como lidas
          </Button>
        </div>
        
        <div className="p-4">
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 rounded-md transition-colors ${
                    notification.read ? 'bg-discord-dark' : 'bg-discord-sidebar'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${
                        notification.type === 'sales'
                          ? 'bg-discord-primary'
                          : notification.type === 'system'
                          ? 'bg-discord-warning'
                          : 'bg-discord-success'
                      }`}></div>
                      <h3 className="text-white font-medium text-sm ml-2">{notification.title}</h3>
                    </div>
                    <span className="text-discord-muted text-xs">{notification.time}</span>
                  </div>
                  <p className="text-discord-light text-sm mt-1 ml-4">{notification.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-discord-muted py-12">
              <i className="fas fa-bell-slash text-4xl mb-4"></i>
              <h3 className="text-lg font-medium text-white mb-2">Nenhuma notificação</h3>
              <p>Você não tem notificações não lidas.</p>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              className="bg-discord-dark border-discord-sidebar text-discord-light hover:bg-discord-hover"
            >
              Ver todas as notificações
            </Button>
          </div>
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="bg-discord-card rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-discord-dark">
          <h2 className="text-white font-bold font-heading">Configurações de Notificação</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-discord-dark border-discord-sidebar">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Notificações de Vendas</CardTitle>
                <CardDescription className="text-discord-muted">Configurações relacionadas a vendas e transações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filterSettingsByCategory('sales').map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between">
                      <div>
                        <Label 
                          htmlFor={`${setting.id}-toggle`} 
                          className="text-discord-light font-medium"
                        >
                          {setting.name}
                        </Label>
                        <p className="text-discord-muted text-sm">{setting.description}</p>
                      </div>
                      <Switch 
                        id={`${setting.id}-toggle`}
                        checked={setting.enabled}
                        onCheckedChange={(checked) => handleToggle(setting.id, checked)}
                        className="data-[state=checked]:bg-discord-primary"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-discord-dark border-discord-sidebar">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Notificações do Sistema</CardTitle>
                <CardDescription className="text-discord-muted">Configurações relacionadas ao sistema e bot</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filterSettingsByCategory('system').map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between">
                      <div>
                        <Label 
                          htmlFor={`${setting.id}-toggle`} 
                          className="text-discord-light font-medium"
                        >
                          {setting.name}
                        </Label>
                        <p className="text-discord-muted text-sm">{setting.description}</p>
                      </div>
                      <Switch 
                        id={`${setting.id}-toggle`}
                        checked={setting.enabled}
                        onCheckedChange={(checked) => handleToggle(setting.id, checked)}
                        className="data-[state=checked]:bg-discord-primary"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-discord-dark border-discord-sidebar">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Notificações de Clientes</CardTitle>
                <CardDescription className="text-discord-muted">Configurações relacionadas a clientes e interações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filterSettingsByCategory('clients').map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between">
                      <div>
                        <Label 
                          htmlFor={`${setting.id}-toggle`} 
                          className="text-discord-light font-medium"
                        >
                          {setting.name}
                        </Label>
                        <p className="text-discord-muted text-sm">{setting.description}</p>
                      </div>
                      <Switch 
                        id={`${setting.id}-toggle`}
                        checked={setting.enabled}
                        onCheckedChange={(checked) => handleToggle(setting.id, checked)}
                        className="data-[state=checked]:bg-discord-primary"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 p-4 bg-discord-dark rounded-md">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-discord-primary bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="fas fa-lightbulb text-discord-primary"></i>
              </div>
              <div className="ml-4">
                <h3 className="text-white font-medium">Dica para notificações</h3>
                <p className="text-sm text-discord-muted mt-1">
                  Você também pode configurar canais específicos no Discord para receber diferentes tipos de notificações usando o comando <code className="bg-discord-bg px-1 rounded font-mono">/config notificacoes</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;
