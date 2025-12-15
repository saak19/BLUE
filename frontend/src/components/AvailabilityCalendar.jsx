import React from 'react';
import { Trash2 } from 'lucide-react';

const AvailabilityCalendar = ({ slots, onDelete }) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Weekly Availability</h3>

                <div className="space-y-4">
                    {days.map(day => {
                        const daySlots = slots.filter(s => s.dayOfWeek === day);
                        if (daySlots.length === 0) return null;

                        return (
                            <div key={day} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                <h4 className="font-medium text-gray-700 mb-2">{day}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {daySlots.map(slot => (
                                        <div key={slot._id} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm flex items-center space-x-2">
                                            <span>{slot.startTime} - {slot.endTime}</span>
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(slot._id)}
                                                    className="hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {slots.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No availability slots set.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AvailabilityCalendar;
