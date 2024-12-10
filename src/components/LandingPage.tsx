import React from 'react';
import { Activity, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-3xl mx-auto">
        <div className="flex justify-center mb-8">
          <Activity className="h-20 w-20 text-blue-600" />
        </div>
        
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Data Hub
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Explore comprehensive health analytics and mortality statistics through
          interactive visualizations and detailed demographic insights.
        </p>

        <button
          onClick={onEnter}
          className="group inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold 
                     hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Enter Dashboard
          <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="absolute bottom-8 text-sm text-gray-500">
        Powered by CDC Open Data
      </div>
    </div>
  );
};