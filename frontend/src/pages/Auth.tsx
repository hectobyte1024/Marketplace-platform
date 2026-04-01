import React, { useState } from 'react';
import { LoginForm } from '../components/LoginForm.js';
import { SignupForm } from '../components/SignupForm.js';

type AuthMode = 'login' | 'signup';

export const Auth: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        {mode === 'login' ? (
          <LoginForm
            onSuccess={onSuccess}
            onSwitchToSignup={() => setMode('signup')}
          />
        ) : (
          <SignupForm
            onSuccess={onSuccess}
            onSwitchToLogin={() => setMode('login')}
          />
        )}
      </div>
    </div>
  );
};
