import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

const botSettingsSchema = z.object({
  botName: z.string().min(2, {
    message: "O nome do bot deve ter pelo menos 2 caracteres.",
  }),
  customPrefix: z.string().optional(),
  mentionResponse: z.boolean().default(true),
  statusMessage: z.string().optional(),
});

const discordSettingsSchema = z.object({
  autoJoinServerChannel: z.boolean().default(true),
  logChannel: z.string().optional(),
  moderationChannel: z.string().optional(),
  welcomeMessageEnabled: z.boolean().default(true),
  welcomeMessage: z.string().optional(),
});

const notificationSettingsSchema = z.object({
  newSaleNotification: z.boolean().default(true),
  newClientNotification: z.boolean().default(true),
  paymentFailureNotification: z.boolean().default(true),
  serverStatusNotification: z.boolean().default(true),
});

type BotSettingsFormValues = z.infer<typeof botSettingsSchema>;
type DiscordSettingsFormValues = z.infer<typeof discordSettingsSchema>;
type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>;

export default function Settings() {
  const [activeTab, setActiveTab] = useState("bot");
  
  const botForm = useForm<BotSettingsFormValues>({
    resolver: zodResolver(botSettingsSchema),
    defaultValues: {
      botName: "DiscordSalesBot",
      customPrefix: "!",
      mentionResponse: true,
      statusMessage: "Gerenciando vendas",
    },
  });
  
  const discordForm = useForm<DiscordSettingsFormValues>({
    resolver: zodResolver(discordSettingsSchema),
    defaultValues: {
      autoJoinServerChannel: true,
      logChannel: "logs",
      moderationChannel: "moderação",
      welcomeMessageEnabled: true,
      welcomeMessage: "Bem-vindo ao servidor! Obrigado por se juntar a nós.",
    },
  });
  
  const notificationForm = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      newSaleNotification: true,
      newClientNotification: true,
      paymentFailureNotification: true,
      serverStatusNotification: true,
    },
  });
  
  function onBotSubmit(data: BotSettingsFormValues) {
    toast({
      title: "Configurações do Bot Atualizadas",
      description: "As configurações do bot foram salvas com sucesso.",
    });
    console.log(data);
  }
  
  function onDiscordSubmit(data: DiscordSettingsFormValues) {
    toast({
      title: "Configurações do Discord Atualizadas",
      description: "As configurações do Discord foram salvas com sucesso.",
    });
    console.log(data);
  }
  
  function onNotificationSubmit(data: NotificationSettingsFormValues) {
    toast({
      title: "Configurações de Notificação Atualizadas",
      description: "As configurações de notificação foram salvas com sucesso.",
    });
    console.log(data);
  }
  
  return (
    <div className="container py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do seu bot de vendas</p>
      </div>
      
      <Tabs defaultValue="bot" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="bot">Bot</TabsTrigger>
          <TabsTrigger value="discord">Discord</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bot">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Bot</CardTitle>
              <CardDescription>
                Personalize as configurações básicas do seu bot de vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...botForm}>
                <form onSubmit={botForm.handleSubmit(onBotSubmit)} className="space-y-6">
                  <FormField
                    control={botForm.control}
                    name="botName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Bot</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Este nome será exibido nas interações do bot.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={botForm.control}
                    name="customPrefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prefixo Personalizado</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Prefixo para comandos de texto (opcional).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={botForm.control}
                    name="mentionResponse"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Responder a Menções</FormLabel>
                          <FormDescription>
                            Permite que o bot responda quando for mencionado.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={botForm.control}
                    name="statusMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensagem de Status</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Status exibido pelo bot no Discord.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Salvar Configurações</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="discord">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Discord</CardTitle>
              <CardDescription>
                Configure como o bot interage com o seu servidor Discord
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...discordForm}>
                <form onSubmit={discordForm.handleSubmit(onDiscordSubmit)} className="space-y-6">
                  <FormField
                    control={discordForm.control}
                    name="autoJoinServerChannel"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Auto-Entrar nos Canais</FormLabel>
                          <FormDescription>
                            O bot entrará automaticamente no canal de voz quando solicitado.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={discordForm.control}
                      name="logChannel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Canal de Logs</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Canal onde o bot enviará logs de atividade.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={discordForm.control}
                      name="moderationChannel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Canal de Moderação</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Canal para alertas de moderação.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <FormField
                    control={discordForm.control}
                    name="welcomeMessageEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Mensagem de Boas-Vindas</FormLabel>
                          <FormDescription>
                            Enviar mensagem de boas-vindas para novos membros.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {discordForm.watch("welcomeMessageEnabled") && (
                    <FormField
                      control={discordForm.control}
                      name="welcomeMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensagem de Boas-Vindas</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Mensagem enviada para novos membros.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <Button type="submit">Salvar Configurações</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Gerencie quais notificações você deseja receber
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <FormField
                    control={notificationForm.control}
                    name="newSaleNotification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Novas Vendas</FormLabel>
                          <FormDescription>
                            Receber notificações quando novas vendas forem realizadas.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationForm.control}
                    name="newClientNotification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Novos Clientes</FormLabel>
                          <FormDescription>
                            Receber notificações quando novos clientes se registrarem.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationForm.control}
                    name="paymentFailureNotification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Falhas de Pagamento</FormLabel>
                          <FormDescription>
                            Receber notificações quando pagamentos falharem.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationForm.control}
                    name="serverStatusNotification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Status do Servidor</FormLabel>
                          <FormDescription>
                            Receber notificações sobre mudanças no status do servidor.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Salvar Configurações</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}