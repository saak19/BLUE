import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, Calendar, Clock, MessageSquare, Code, Plus, ChevronDown, Video, Send } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Profile Settings', path: '/profile', icon: User },
        { name: 'Availability', path: '/availability', icon: Clock },
        { name: 'Bookings', path: '/bookings', icon: Calendar },
        { name: 'Requests', path: '/requests', icon: MessageSquare },
        { name: 'Embed Widget', path: '/embed-code', icon: Code },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard shortcut Ctrl+K / Cmd+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsDropdownOpen(prev => !prev);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleOptionClick = (path, actionName) => {
        localStorage.setItem('lastCreateAction', actionName);
        navigate(path);
        setIsDropdownOpen(false);
    };

    const createOptions = [
        { name: 'Instant Call', path: '/instant-call', icon: Video, action: 'instant_call' },
        { name: 'Send Request', path: '/requests', icon: Send, action: 'send_request' },
        { name: 'Book a meeting', path: '/availability', icon: Calendar, action: 'book_meeting' },
    ];

    const lastAction = localStorage.getItem('lastCreateAction');

    return (
        <aside className="w-64 bg-white shadow-sm min-h-screen hidden md:flex flex-col border-r border-gray-200" style={{ fontFamily: 'Poppins, sans-serif' }}>

            {/* Create Button Section */}
            <div className="p-4 pb-2" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 group"
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                >
                    <Plus size={20} className="group-hover:scale-110 transition-transform" />
                    <span>Create</span>
                    <ChevronDown size={16} className={`ml-auto transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute left-4 w-60 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="py-1">
                            {/* Removed Quick Actions Header as requested */}
                            {createOptions.map((option) => (
                                <button
                                    key={option.name}
                                    onClick={() => handleOptionClick(option.path, option.action)}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center transition-colors"
                                >
                                    <option.icon size={18} className={`mr-3 ${lastAction === option.action ? 'text-blue-500' : 'text-gray-400'}`} />
                                    <span className="flex-1 font-medium">{option.name}</span>
                                    {lastAction === option.action && (
                                        <span className="w-2 h-2 rounded-full bg-blue-500" title="Last used"></span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon size={20} className={`${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 text-xs text-center text-gray-400 border-t border-gray-100">
                LiveConnect v1.0
            </div>
        </aside>
    );
};

export default Sidebar;
