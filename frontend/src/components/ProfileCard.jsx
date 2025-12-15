import React from 'react';
import { Clock, Globe } from 'lucide-react';

const ProfileCard = ({ profile }) => {
    if (!profile) return <div className="p-6 bg-white rounded-xl shadow-sm">Loading profile...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                        {/* Fallback avatar */}
                        {profile.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" /> : (profile.userId?.name?.[0] || 'U')}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{profile.userId?.name || 'User'}</h2>
                        <p className="text-blue-600">{profile.title || 'No Title'}</p>
                    </div>
                </div>

                <p className="text-gray-600 mb-6">{profile.bio || 'No bio yet.'}</p>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                        <Globe size={16} />
                        <span>{profile.timezone || 'UTC'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Clock size={16} />
                        <span>{profile.responseTime || 'Unknown'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
