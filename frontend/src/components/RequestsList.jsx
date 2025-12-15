import React from 'react';
import { Check, X } from 'lucide-react';

const RequestsList = ({ requests, onAccept, onReject }) => {
    if (!requests.length) {
        return <div className="text-gray-500 text-center py-4">No pending requests.</div>;
    }

    return (
        <div className="space-y-4">
            {requests.map((req) => (
                <div key={req._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-start">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900">{req.visitorName}</span>
                            <span className="text-sm text-gray-500">({req.visitorEmail})</span>
                        </div>
                        <p className="text-gray-700 mt-2 text-sm bg-gray-50 p-2 rounded">{req.message}</p>
                        <span className="text-xs text-gray-400 mt-2 block">{new Date(req.createdAt).toLocaleString()}</span>
                    </div>

                    {req.status === 'pending' && (
                        <div className="flex space-x-2">
                            <button
                                onClick={() => onAccept(req._id)}
                                className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                                title="Accept"
                            >
                                <Check size={18} />
                            </button>
                            <button
                                onClick={() => onReject(req._id)}
                                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                                title="Reject"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    {req.status !== 'pending' && (
                        <span className={`px-2 py-1 text-xs rounded-full ${req.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default RequestsList;
