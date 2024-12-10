import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DataCardProps {
  title: string;
  value: string;
  Icon: LucideIcon;
  iconColor: string;
}

export const DataCard: React.FC<DataCardProps> = ({ title, value, Icon, iconColor }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center">
        <div className={`${iconColor} p-3 rounded-full bg-opacity-10`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};