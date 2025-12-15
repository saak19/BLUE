import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const ProfileSettingsPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        bio: '',
        avatar: '',
        timezone: 'UTC',
        responseTime: 'Within 24 hours'
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/profiles/me');
                if (res.data) {
                    setFormData({
                        title: res.data.title || '',
                        bio: res.data.bio || '',
                        avatar: res.data.avatar || '',
                        timezone: res.data.timezone || 'UTC',
                        responseTime: res.data.responseTime || 'Within 24 hours'
                    });
                }
            } catch (err) {
                console.error('Error fetching profile', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await api.put('/profiles/me', formData);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setMessage('Error updating profile.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-8">
                    <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>
                        {message && <div className={`p-4 mb-4 rounded ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{message}</div>}

                        {loading ? <p>Loading...</p> : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Job Title / Headline</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                                    <textarea
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                        value={formData.avatar}
                                        onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Timezone</label>
                                        <select
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                            value={formData.timezone}
                                            onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                                        >
                                            <option value="UTC">UTC</option>
                                            <option value="EST">EST</option>
                                            <option value="PST">PST</option>
                                            {/* Add more as needed */}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Response Time</label>
                                        <select
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                                            value={formData.responseTime}
                                            onChange={e => setFormData({ ...formData, responseTime: e.target.value })}
                                        >
                                            <option value="Within 1 hour">Within 1 hour</option>
                                            <option value="Within 24 hours">Within 24 hours</option>
                                            <option value="Within 2 days">Within 2 days</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfileSettingsPage;
