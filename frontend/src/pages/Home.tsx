import React from 'react';

export const Home: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">🌐 Marketplace Platform</h1>
        <p className="text-xl text-gray-700 mb-8">Airbnb for Workspaces - Find and book the perfect workspace</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-2xl font-bold mb-2">🛠️ Browse Workspaces</h3>
            <p className="text-gray-600">Discover available workspaces near you with real-time availability</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-2xl font-bold mb-2">📅 Book Instantly</h3>
            <p className="text-gray-600">Real-time booking system with dynamic pricing</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-2xl font-bold mb-2">🧠 Smart Features</h3>
            <p className="text-gray-600">AI-powered recommendations and demand prediction</p>
          </div>
        </div>

        <a
          href="/workspaces"
          className="inline-block mt-12 bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-blue-700"
        >
          Get Started
        </a>
      </div>
    </div>
  );
};
