import React from 'react';
import { Card } from '@/components/ui/card';

export interface CommandCardProps {
  name: string;
  description: string;
  usage: string;
  icon: string;
  minPlan: string;
  usageCount: number;
}

const CommandCard: React.FC<CommandCardProps> = ({
  name,
  description,
  usage,
  icon,
  minPlan,
  usageCount
}) => {
  return (
    <div className="bg-discord-dark rounded-md p-4">
      <div className="flex items-center">
        <div className="text-discord-primary">
          <i className={icon}></i>
        </div>
        <div className="ml-3">
          <h3 className="text-white font-medium">/{name}</h3>
          <p className="text-xs text-discord-muted mt-1">{description}</p>
        </div>
      </div>
      <div className="mt-3 text-xs text-discord-muted">
        <code className="bg-discord-bg px-2 py-1 rounded font-mono">{usage}</code>
      </div>
      <div className="mt-3 flex justify-between">
        <span className="text-xs text-discord-muted">Plano: <span className="text-discord-light">{minPlan}</span></span>
        <span className="text-xs text-discord-muted">Usos: <span className="text-discord-light">{usageCount}</span></span>
      </div>
    </div>
  );
};

export default CommandCard;
