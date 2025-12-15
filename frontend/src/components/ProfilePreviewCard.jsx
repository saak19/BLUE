import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Edit, Calendar, MoreVertical, Power, Trash, Link, Code } from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';
import EmbedOptionsModal from '../components/EmbedOptionsModal';

const ProfilePreviewCard = () => {
    const [cardData, setCardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [showEmbedModal, setShowEmbedModal] = useState(false);

    const navigate = useNavigate();
    const menuRef = useRef(null);

    const fetchCardData = async () => {
        try {
            const response = await api.get('/instant-call/me');
            setCardData(response.data);
            setError(null);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setCardData(null);
            } else {
                setError('Failed to load profile preview');
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCardData();
        const interval = setInterval(fetchCardData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'busy': return 'bg-yellow-500';
            case 'offline': return 'bg-gray-400';
            default: return 'bg-gray-400';
        }
    };

    const handleEdit = () => {
        navigate('/instant-call');
        setMenuOpen(false);
    };

    const handleToggleStatus = async () => {
        if (!cardData) return;
        setActionLoading(true);
        const newStatus = cardData.status === 'online' ? 'offline' : 'online';
        try {
            await api.patch('/instant-call/status', { status: newStatus });
            setCardData(prev => ({ ...prev, status: newStatus }));
            alert(`Status updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating status', error);
            alert('Failed to update status');
        } finally {
            setActionLoading(false);
            setMenuOpen(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete your Instant Call card? This cannot be undone.')) return;
        setActionLoading(true);
        try {
            await api.delete('/instant-call/me');
            setCardData(null);
            alert('Card deleted successfully');
        } catch (error) {
            console.error('Error deleting card', error);
            alert('Failed to delete card');
        } finally {
            setActionLoading(false);
            setMenuOpen(false);
        }
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/call/${cardData.userId || cardData._id}`; // Using hypothetical URL
        navigator.clipboard.writeText(link);
        alert('Public link copied to clipboard!');
        setMenuOpen(false);
    };

    const handleEmbed = () => {
        setShowEmbedModal(true);
        setMenuOpen(false);
    };

    if (loading) {
        return (
            <div className="w-72 h-[420px] bg-gray-100 rounded-3xl animate-pulse flex items-center justify-center text-gray-400">
                Loading profile...
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-72 h-[420px] bg-red-50 rounded-3xl border border-red-100 flex items-center justify-center text-red-500 p-4 text-center">
                {error}
                <button onClick={fetchCardData} className="block mt-2 underline text-sm">Retry</button>
            </div>
        );
    }

    if (!cardData) {
        return (
            <div className="w-72 h-[420px] bg-white rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-6 text-center shadow-sm">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Phone className="text-blue-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No active card</h3>
                <p className="text-sm text-gray-500 mb-6">Create your instant call card to start receiving calls.</p>
                <button
                    onClick={() => navigate('/instant-call')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                    Create Card
                </button>
            </div>
        );
    }

    const { name, bio, status, profileImage, settings, createdAt, updatedAt } = cardData;

    // Use saved settings or defaults
    const textColor = settings?.textColor || '#1f2937';
    const backgroundColor = settings?.backgroundColor || '#ffffff';
    const buttonColor = settings?.buttonColor || '#2563eb';
    const buttonTextColor = settings?.buttonTextColor || '#ffffff';

    return (
        <div className="flex flex-col items-left relative">
            <div
                className="group relative w-72 min-h-[420px] rounded-3xl shadow-xl p-6 flex flex-col items-center transition-all duration-300 hover:shadow-2xl overflow-hidden"
                style={{ backgroundColor, color: textColor }}
            >
                {/* 3-Dot Menu Button */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="absolute top-4 right-4 z-20 p-1 rounded-full bg-white/20 hover:bg-white/40 transition-colors text-white/80 hover:text-white"
                >
                    <MoreVertical size={20} />
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                    <div ref={menuRef} className="absolute top-12 right-4 z-50 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden text-gray-700 text-sm font-medium animate-in fade-in zoom-in-50 duration-200 origin-top-right">
                        <button onClick={handleEdit} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center transition-colors">
                            <Edit size={16} className="mr-3 text-gray-500" /> Edit Card
                        </button>
                        <button onClick={handleToggleStatus} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center transition-colors">
                            <Power size={16} className={`mr-3 ${status === 'online' ? 'text-green-500' : 'text-gray-400'}`} />
                            Turn {status === 'online' ? 'Off' : 'On'}
                        </button>
                        <button onClick={handleCopyLink} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center transition-colors">
                            <Link size={16} className="mr-3 text-gray-500" /> Copy Link
                        </button>
                        <button onClick={handleEmbed} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center transition-colors">
                            <Code size={16} className="mr-3 text-gray-500" /> Add to Website
                        </button>
                        <div className="h-px bg-gray-100 my-1"></div>
                        <button onClick={handleDelete} className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 flex items-center transition-colors">
                            <Trash size={16} className="mr-3" /> Delete
                        </button>
                    </div>
                )}

                {/* Status Badge (Positioned left relative to menu) */}
                <div className="absolute top-4 left-4 flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-2 py-1 rounded-full shadow-sm border border-white/10">
                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status)}`}></div>
                    <span className="text-xs font-medium opacity-90 capitalize">{status}</span>
                </div>

                <div className="mt-8 mb-4 relative">
                    <div className="w-32 h-32 rounded-full p-1 bg-white/20 backdrop-blur-sm shadow-sm">
                        <img
                            src={profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                            alt={name}
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-center mb-2">{name}</h3>

                <p className="text-sm text-center leading-relaxed mb-8 opacity-90 px-2 flex-grow">
                    {bio || 'No bio provided.'}
                </p>

                <button
                    className="w-full py-3 rounded-lg font-semibold flex items-center justify-center shadow-lg transition-transform hover:scale-105 hover:opacity-90 mt-auto mb-4"
                    style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                >
                    <Phone size={20} className="mr-2" />
                    Call Now
                </button>

                <div className="text-xs opacity-50 absolute bottom-4">Powered by LiveConnect</div>
            </div>

            {/* Metadata */}
            <div className="mt-4 text-xs text-gray-400 space-y-1 text-center">
                <p>Created: {createdAt ? format(new Date(createdAt), 'MMM d, yyyy') : 'N/A'}</p>
                <p>Last Updated: {updatedAt ? format(new Date(updatedAt), 'MMM d, h:mm a') : 'N/A'}</p>
            </div>

            <EmbedOptionsModal
                isOpen={showEmbedModal}
                onClose={() => setShowEmbedModal(false)}
                hostId={cardData && (cardData.userId || cardData._id)}
            />
        </div>
    );
};

export default ProfilePreviewCard;
