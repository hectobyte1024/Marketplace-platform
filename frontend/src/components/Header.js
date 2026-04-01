import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useUserStore } from '../stores/index.js';
import { authService } from '../services/api.js';
export const Header = ({ onLogout }) => {
    const user = useUserStore((state) => state.user);
    const logout = useUserStore((state) => state.logout);
    const handleLogout = async () => {
        try {
            await authService.logout();
        }
        catch (error) {
            console.error('Logout error:', error);
        }
        finally {
            logout();
            if (onLogout)
                onLogout();
        }
    };
    return (_jsx("header", { className: "bg-white shadow", children: _jsxs("nav", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: "\uD83C\uDF10 Marketplace" }), _jsxs("ul", { className: "flex gap-6 items-center", children: [_jsx("li", { children: _jsx("a", { href: "/", className: "text-gray-700 hover:text-blue-600", children: "Home" }) }), _jsx("li", { children: _jsx("a", { href: "/workspaces", className: "text-gray-700 hover:text-blue-600", children: "Browse" }) }), user && (_jsxs(_Fragment, { children: [_jsx("li", { children: _jsx("a", { href: "/my-bookings", className: "text-gray-700 hover:text-blue-600", children: "My Bookings" }) }), user.role === 'host' && (_jsx("li", { children: _jsx("a", { href: "/my-workspaces", className: "text-gray-700 hover:text-blue-600", children: "My Workspaces" }) }))] })), user ? (_jsxs(_Fragment, { children: [_jsx("li", { className: "text-gray-700", children: _jsxs("span", { className: "text-sm flex items-center gap-2", children: ["\uD83D\uDC64 ", user.name, _jsx("span", { className: "text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded", children: user.role })] }) }), _jsx("li", { children: _jsx("button", { onClick: handleLogout, className: "text-gray-700 hover:text-red-600 font-medium", children: "Logout" }) })] })) : (_jsx("li", { children: _jsx("a", { href: "/auth", className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700", children: "Login" }) }))] })] }) }));
};
