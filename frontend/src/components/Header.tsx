import React from 'react';
import { useUserStore } from '../stores/index.js';
import { authService } from '../services/api.js';

interface HeaderProps {
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      if (onLogout) onLogout();
    }
  };

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">🌐 Marketplace</div>
        <ul className="flex gap-6 items-center">
          <li><a href="/" className="text-gray-700 hover:text-blue-600">Home</a></li>
          <li><a href="/workspaces" className="text-gray-700 hover:text-blue-600">Browse</a></li>
          {user && (
            <>
              <li><a href="/my-bookings" className="text-gray-700 hover:text-blue-600">My Bookings</a></li>
              {user.role === 'host' && (
                <li><a href="/my-workspaces" className="text-gray-700 hover:text-blue-600">My Workspaces</a></li>
              )}
            </>
          )}
          {user ? (
            <>
              <li className="text-gray-700">
                <span className="text-sm flex items-center gap-2">
                  👤 {user.name}
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {user.role}
                  </span>
                </span>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 font-medium"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li><a href="/auth" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Login</a></li>
          )}
        </ul>
      </nav>
    </header>
  );
};
