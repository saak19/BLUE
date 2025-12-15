import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AvailabilityCalendar from '../components/AvailabilityCalendar';

const AvailabilityPage = () => {
    const [slots, setSlots] = useState([]);
    const [formData, setFormData] = useState({
        dayOfWeek: 'Monday',
        startTime: '09:00',
        endTime: '17:00'
    });

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            const res = await api.get('/availability/me');
            setSlots(res.data);
        } catch (err) {
            console.error('Error fetching slots', err);
        }
    };

    const handleAddSlot = async (e) => {
        e.preventDefault();
        try {
            await api.post('/availability', formData);
            fetchSlots();
        } catch (err) {
            alert('Error adding slot');
        }
    };

    const handleDeleteSlot = async (id) => {
        if (!window.confirm('Delete this slot?')) return;
        try {
            await api.delete(`/availability/${id}`);
            fetchSlots();
        } catch (err) {
            alert('Error deleting slot');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Availability</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Slot</h2>
                                <form onSubmit={handleAddSlot} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Day</label>
                                        <select
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                            value={formData.dayOfWeek}
                                            onChange={e => setFormData({ ...formData, dayOfWeek: e.target.value })}
                                        >
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Start Time</label>
                                            <input
                                                type="time"
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                                value={formData.startTime}
                                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">End Time</label>
                                            <input
                                                type="time"
                                                required
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                                                value={formData.endTime}
                                                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                    >
                                        Add Slot
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <AvailabilityCalendar slots={slots} onDelete={handleDeleteSlot} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AvailabilityPage;
