import React from 'react';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, children }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">{title}</h2>
      {children}
    </div>
  );
};