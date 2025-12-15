import React, { useState } from 'react';
import { X, Copy, Check, Code, ExternalLink, MessageSquare, Layout } from 'lucide-react';

const EmbedOptionsModal = ({ isOpen, onClose, hostId }) => {
    if (!isOpen) return null;

    const baseUrl = window.location.origin;
    const directLink = `${baseUrl}/call/${hostId}`;

    // Embed Codes
    const embedOptions = [
        {
            id: 'inline',
            title: 'Inline Embed',
            description: 'Add a scheduling page directly to your site.',
            icon: Layout,
            code: `<div id="liveconnect-embed" style="min-width:320px;height:600px;"></div>
<script src="${baseUrl}/embed.js" data-host="${hostId}" data-type="inline"></script>`
        },
        {
            id: 'popup-widget',
            title: 'Popup Widget',
            description: 'Add a floating button that opens a popup.',
            icon: MessageSquare,
            code: `<script src="${baseUrl}/embed.js" data-host="${hostId}" data-type="widget" data-color="#2563eb"></script>`
        },
        {
            id: 'popup-text',
            title: 'Popup Text',
            description: 'Add a text link that opens a popup.',
            icon: Code,
            code: `<a href="#" onclick="LiveConnect.open('${hostId}'); return false;">Schedule a Call</a>
<script src="${baseUrl}/embed.js"></script>`
        },
        {
            id: 'iframe',
            title: 'iFrame Embed',
            description: 'Embed the card using a standard iframe.',
            icon: Code,
            code: `<iframe src="${baseUrl}/embed/call/${hostId}" width="100%" height="600" frameborder="0"></iframe>`
        },
        {
            id: 'direct',
            title: 'Direct Link',
            description: 'Share this URL directly with your audience.',
            icon: ExternalLink,
            code: directLink
        }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">How do you want to add to your site?</h2>
                        <p className="text-sm text-gray-500 mt-1">Choose an option below to copy the code.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {embedOptions.map((option) => (
                            <EmbedOptionCard key={option.id} option={option} />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

const EmbedOptionCard = ({ option }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(option.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all bg-white flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <option.icon size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{option.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                    </div>
                </div>
            </div>

            <div className="relative bg-gray-900 rounded-lg p-3 group mt-auto">
                <code className="text-xs text-gray-300 font-mono block overflow-x-auto whitespace-nowrap scrollbar-hide pr-16 h-8 flex items-center">
                    {option.code}
                </code>
                <div className="absolute top-1/2 -translate-y-1/2 right-2">
                    <button
                        onClick={handleCopy}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${copied
                                ? 'bg-green-500 text-white'
                                : 'bg-white text-gray-900 hover:bg-gray-100'
                            }`}
                    >
                        {copied ? (
                            <>
                                <Check size={12} />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy size={12} />
                                <span>Copy Code</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmbedOptionsModal;
