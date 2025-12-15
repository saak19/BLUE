import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Phone, Upload, Save, Code } from 'lucide-react';
import api from '../services/api';
import EmbedOptionsModal from '../components/EmbedOptionsModal';

const InstantCallPage = () => {
    const [formData, setFormData] = useState({
        name: 'John Doe',
        bio: 'Looking forward to chatting with you!',
        status: 'online',
        profileImage: null,
        profileImagePreview: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
    });

    const [cardStyle, setCardStyle] = useState({
        textColor: '#1f2937', // gray-800
        backgroundColor: '#ffffff',
        buttonColor: '#2563eb', // blue-600
        buttonTextColor: '#ffffff'
    });

    const [showEmbedModal, setShowEmbedModal] = useState(false);
    const [hostId, setHostId] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const fileInputRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStyleChange = (e) => {
        const { name, value } = e.target;
        setCardStyle(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    profileImage: file,
                    profileImagePreview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Fetch existing settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/instant-call/me');
                const data = response.data;
                if (data) {
                    setHostId(data.userId || data._id);
                    setFormData({
                        name: data.name,
                        bio: data.bio || '',
                        status: data.status || 'online',
                        profileImage: null, // File input remains empty
                        profileImagePreview: data.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
                    });
                    if (data.settings) {
                        setCardStyle({
                            textColor: data.settings.textColor || '#1f2937',
                            backgroundColor: data.settings.backgroundColor || '#ffffff',
                            buttonColor: data.settings.buttonColor || '#2563eb',
                            buttonTextColor: data.settings.buttonTextColor || '#ffffff'
                        });
                    }
                }
            } catch (error) {
                // Ignore 404 (not configured yet)
                if (error.response && error.response.status !== 404) {
                    console.error('Failed to fetch settings:', error);
                }
            } finally {
                setInitialLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                bio: formData.bio,
                status: formData.status,
                profileImage: formData.profileImagePreview,
                settings: cardStyle
            };

            const response = await api.post('/instant-call', payload);

            if (response.data && response.data.data && response.data.data.userId) {
                setHostId(response.data.data.userId); // Ensure this is set for the "Add to Website" button
            } else if (!hostId) {
                const res = await api.get('/instant-call/me');
                if (res.data) setHostId(res.data.userId || res.data._id);
            }

            // setShowEmbedModal(true); // User will now click the button
            alert('Configuration saved successfully!');
        } catch (error) {
            console.error('Error saving configuration:', error);
            alert('Failed to save configuration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'busy': return 'bg-yellow-500';
            case 'offline': return 'bg-gray-400';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-poppins">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-8 flex flex-col lg:flex-row gap-8">

                    {/* Left Side: Settings */}
                    <div className="flex-1 max-w-2xl">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">Instant Call Configuration</h1>

                        <div className="space-y-6">
                            {/* Profile Info Section */}
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                                <h2 className="text-lg font-semibold mb-4 text-gray-800">Profile Information</h2>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Your Name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="online">Online</option>
                                            <option value="busy">Busy</option>
                                            <option value="offline">Offline</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            rows="3"
                                            maxLength="150"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Short bio..."
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={formData.profileImagePreview}
                                                alt="Preview"
                                                className="w-16 h-16 rounded-full object-cover border border-gray-200"
                                            />
                                            <button
                                                onClick={() => fileInputRef.current.click()}
                                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                                            >
                                                <Upload size={16} className="mr-2" />
                                                Upload Image
                                            </button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Styles Section */}
                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                                <h2 className="text-lg font-semibold mb-4 text-gray-800">Card Appearance</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="color"
                                                name="textColor"
                                                value={cardStyle.textColor}
                                                onChange={handleStyleChange}
                                                className="h-9 w-16 p-0 border border-gray-300 rounded"
                                            />
                                            <span className="text-xs text-gray-500">{cardStyle.textColor}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="color"
                                                name="backgroundColor"
                                                value={cardStyle.backgroundColor}
                                                onChange={handleStyleChange}
                                                className="h-9 w-16 p-0 border border-gray-300 rounded"
                                            />
                                            <span className="text-xs text-gray-500">{cardStyle.backgroundColor}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Button Color</label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="color"
                                                name="buttonColor"
                                                value={cardStyle.buttonColor}
                                                onChange={handleStyleChange}
                                                className="h-9 w-16 p-0 border border-gray-300 rounded"
                                            />
                                            <span className="text-xs text-gray-500">{cardStyle.buttonColor}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Button Text Color</label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="color"
                                                name="buttonTextColor"
                                                value={cardStyle.buttonTextColor}
                                                onChange={handleStyleChange}
                                                className="h-9 w-16 p-0 border border-gray-300 rounded"
                                            />
                                            <span className="text-xs text-gray-500">{cardStyle.buttonTextColor}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 mt-8">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-md transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Saving...' : <><Save size={20} className="mr-2" /> Save Configuration</>}
                                </button>

                                <button
                                    onClick={() => setShowEmbedModal(true)}
                                    disabled={!hostId || loading}
                                    className={`flex-1 font-semibold py-3 rounded-lg shadow-md transition-colors flex items-center justify-center ${!hostId || loading
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                >
                                    <Code size={20} className="mr-2" /> Add to Website
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Preview */}
                    <div className="flex-1 relative">
                        <div className="sticky top-8 flex flex-col items-center">
                            <h2 className="text-lg font-semibold text-gray-500 mb-4">Live Preview</h2>

                            <div
                                className="w-72 min-h-[420px] rounded-3xl shadow-2xl p-6 flex flex-col items-center transition-colors duration-200 relative overflow-hidden"
                                style={{
                                    backgroundColor: cardStyle.backgroundColor,
                                    color: cardStyle.textColor
                                }}
                            >
                                {/* Top Right Status Badge */}
                                <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-2 py-1 rounded-full shadow-sm border border-white/10">
                                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(formData.status)}`}></div>
                                    <span className="text-xs font-medium opacity-90 capitalize">{formData.status}</span>
                                </div>

                                <div className="mt-8 mb-4 relative">
                                    <div className="w-32 h-32 rounded-full p-1 bg-white/20 backdrop-blur-sm shadow-sm">
                                        <img
                                            src={formData.profileImagePreview}
                                            alt="Profile"
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-center mb-2">{formData.name}</h3>

                                <p className="text-sm text-center leading-relaxed mb-8 opacity-90 px-2 flex-grow">
                                    {formData.bio || 'No bio provided.'}
                                </p>

                                <button
                                    className="w-full py-3 rounded-lg font-semibold flex items-center justify-center shadow-lg transition-transform hover:scale-105 hover:opacity-90 mt-auto mb-4"
                                    style={{
                                        backgroundColor: cardStyle.buttonColor,
                                        color: cardStyle.buttonTextColor
                                    }}
                                >
                                    <Phone size={20} className="mr-2" />
                                    Call Now
                                </button>

                                <div className="text-xs opacity-50 absolute bottom-4">Powered by LiveConnect</div>
                            </div>

                            <p className="text-sm text-gray-400 mt-4 text-center">
                                This preview shows how your card will appear to visitors.
                            </p>
                        </div>
                    </div>

                </main>
            </div>

            <EmbedOptionsModal
                isOpen={showEmbedModal}
                onClose={() => setShowEmbedModal(false)}
                hostId={hostId || 'username'}
            />
        </div>
    );
};

export default InstantCallPage;
