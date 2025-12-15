import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getCurrentUser } from '../services/auth';

const EmbedCodePage = () => {
    const user = getCurrentUser();
    // In real app, hostId would be user.id or profileId.
    // We'll trust user.id is available.
    const hostId = user?.id || user?._id || 'YOUR_HOST_ID';

    const embedScript = `<script src="http://localhost:3001/embed.js" data-host-id="${hostId}"></script>`;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Get Your Embed Widget</h1>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
                        <p className="text-gray-600 mb-4">
                            Copy and paste the code below into your website's HTML where you want the widget to appear.
                            Make sure you include it before the closing <code>&lt;/body&gt;</code> tag.
                        </p>

                        <div className="bg-gray-800 rounded-lg p-4 relative group">
                            <code className="text-green-400 text-sm font-mono break-all">
                                {embedScript}
                            </code>
                            <button
                                onClick={() => navigator.clipboard.writeText(embedScript)}
                                className="absolute top-2 right-2 bg-white text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                Copy
                            </button>
                        </div>

                        <div className="mt-6">
                            <h3 className="font-bold text-gray-900 mb-2">Preview</h3>
                            <div className="border border-dashed border-gray-300 p-8 rounded-lg text-center text-gray-500">
                                (Widget preview would appear here if script was loaded)
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmbedCodePage;
