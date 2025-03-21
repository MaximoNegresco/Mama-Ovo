import React from 'react';

interface StatCardProps {
  icon: string;
  title: string;
  value: string;
  subtext?: string;
  color: 'blue' | 'green' | 'purple' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  subtext,
  color
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500 bg-opacity-10 text-blue-400';
      case 'green':
        return 'bg-green-500 bg-opacity-10 text-green-400';
      case 'purple':
        return 'bg-purple-500 bg-opacity-10 text-purple-400';
      case 'red':
        return 'bg-red-500 bg-opacity-10 text-red-400';
      default:
        return 'bg-blue-500 bg-opacity-10 text-blue-400';
    }
  };

  return (
    <div className="bg-discord-card rounded-lg shadow-md p-4">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${getColorClasses(color)}`}>
          <i className={`${icon} text-xl`}></i>
        </div>
        <div className="ml-4">
          <p className="text-discord-muted text-sm">{title}</p>
          <h3 className="text-white text-2xl font-bold font-heading">{value}</h3>
          {subtext && (
            <p className={`text-xs mt-1 ${
              subtext.includes('▲') ? 'text-discord-success' : 
              subtext.includes('▼') ? 'text-discord-error' : 
              'text-discord-muted'
            }`}>
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
