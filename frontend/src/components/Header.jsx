import React from 'react';
import { logout, getCurrentUser } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Zap } from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();
    const user = getCurrentUser();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center">
                <h1 className="text-xl font-bold text-blue-600">LiveConnect</h1>
            </div>
            <div className="flex items-center space-x-4">
                <button className="hidden md:flex bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 items-center gap-2 text-sm font-semibold">
                    <Zap size={16} className="text-yellow-300" fill="currentColor" />
                    Upgrade to Professional
                </button>

                {user && (
                    <div className="flex items-center space-x-2 border-l pl-4 border-gray-200">
                        <div className="bg-gray-100 p-2 rounded-full">
                            <UserIcon size={20} className="text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-700">{user.name}</span>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;
