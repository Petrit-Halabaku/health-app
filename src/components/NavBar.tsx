import React from 'react';
import { Activity, BarChart2, TrendingUp } from 'lucide-react';

interface NavBarProps {
  activeTab: 'dashboard' | 'specific' | 'trends';
  onTabChange: (tab: 'dashboard' | 'specific' | 'trends') => void;
}

export const NavBar: React.FC<NavBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="bg-white shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Activity className="h-5 w-5" />
              <span>CDC Mortality Dashboard</span>
            </button>
            <button
              onClick={() => onTabChange('specific')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'specific'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart2 className="h-5 w-5" />
              <span>Specific Data</span>
            </button>
            <button
              onClick={() => onTabChange('trends')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'trends'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              <span>Mortality Trends</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};