import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ProfilePreviewCard from '../components/ProfilePreviewCard';
import IncomingCallModal from '../components/IncomingCallModal';

const DashboardPage = () => {
    const [stats, setStats] = useState({ bookings: 0, requests: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch stats concurrently
                const [bookingsRes, requestsRes] = await Promise.all([
                    api.get('/bookings/me'),
                    api.get('/requests/me')
                ]);

                setStats({
                    bookings: bookingsRes.data.length,
                    requests: requestsRes.data.filter(r => r.status === 'pending').length
                });
            } catch (err) {
                console.error('Error loading dashboard stats', err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-500 text-sm font-medium">Pending Requests</h3>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.requests}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-500 text-sm font-medium">Upcoming Bookings</h3>
                            <p className="text-3xl font-bold text-green-600 mt-2">{stats.bookings}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-gray-500 text-sm font-medium">Profile Status</h3>
                            <p className="text-xl font-bold text-gray-800 mt-2">Active</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Profile Preview</h2>
                            <ProfilePreviewCard />
                        </div>
                        {/* Could add recent activity list here */}
                    </div>
                </main>
            </div>
            <IncomingCallModal />
        </div>
    );
};

export default DashboardPage;
