import React, { useState } from 'react';

const BookingForm = ({ onSubmit, availableSlots = [] }) => {
    const [formData, setFormData] = useState({
        visitorName: '',
        visitorEmail: '',
        date: '',
        timeSlot: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to combine date and timeSlot into start/end time
        // For simplicity, passing raw data or specific format
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Your Name</label>
                <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    value={formData.visitorName}
                    onChange={e => setFormData({ ...formData, visitorName: e.target.value })}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Your Email</label>
                <input
                    type="email"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    value={formData.visitorEmail}
                    onChange={e => setFormData({ ...formData, visitorEmail: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Time Slot</label>
                    <select
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        value={formData.timeSlot}
                        onChange={e => setFormData({ ...formData, timeSlot: e.target.value })}
                    >
                        <option value="">Select a time</option>
                        {availableSlots.map((slot, idx) => (
                            <option key={idx} value={`${slot.startTime}-${slot.endTime}`}>
                                {slot.startTime} - {slot.endTime}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Book Appointment
            </button>
        </form>
    );
};

export default BookingForm;
