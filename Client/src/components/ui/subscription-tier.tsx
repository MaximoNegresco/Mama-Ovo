import React from 'react';
import { Card } from '@/components/ui/card';

export interface SubscriptionTierProps {
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  color: string;
  subscribers: number;
  hasBorder?: boolean;
}

const SubscriptionTier: React.FC<SubscriptionTierProps> = ({
  name,
  price,
  features,
  isPopular = false,
  color,
  subscribers,
  hasBorder = false
}) => {
  return (
    <div className={`bg-discord-dark rounded-md p-4 ${hasBorder ? 'border-2 border-discord-primary' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <h3 className="ml-2 text-white font-medium">{name}</h3>
            {isPopular && (
              <span className="ml-2 text-xs bg-discord-primary px-2 py-0.5 rounded-full text-white">
                Popular
              </span>
            )}
          </div>
          <p className="text-sm text-discord-muted mt-1">{price}</p>
        </div>
        <div className="text-discord-muted">
          <span className="text-xs bg-discord-bg px-2 py-1 rounded">{subscribers} assinantes</span>
        </div>
      </div>
      <div className="mt-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center text-xs text-discord-muted mt-1">
            <i className="fas fa-check text-discord-success mr-2"></i>
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionTier;
