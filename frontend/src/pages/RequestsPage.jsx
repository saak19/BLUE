import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import RequestsList from '../components/RequestsList';

const RequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/requests/me');
            setRequests(res.data);
        } catch (err) {
            console.error('Error fetching requests', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            await api.put(`/requests/${id}/status`, { status: 'accepted' });
            fetchRequests();
        } catch (err) {
            alert('Error accepting request');
        }
    };

    const handleReject = async (id) => {
        try {
            await api.put(`/requests/${id}/status`, { status: 'rejected' });
            fetchRequests();
        } catch (err) {
            alert('Error rejecting request');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Connection Requests</h1>
                    <div className="max-w-3xl">
                        {loading ? <p>Loading...</p> : (
                            <RequestsList
                                requests={requests}
                                onAccept={handleAccept}
                                onReject={handleReject}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RequestsPage;
