import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { LoginForm } from '../components/LoginForm.js';
import { SignupForm } from '../components/SignupForm.js';
export const Auth = ({ onSuccess }) => {
    const [mode, setMode] = useState('login');
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center", children: _jsx("div", { className: "w-full max-w-md", children: mode === 'login' ? (_jsx(LoginForm, { onSuccess: onSuccess, onSwitchToSignup: () => setMode('signup') })) : (_jsx(SignupForm, { onSuccess: onSuccess, onSwitchToLogin: () => setMode('login') })) }) }));
};
