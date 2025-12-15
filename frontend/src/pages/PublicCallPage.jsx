import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import api from '../services/api';
import useWebSocket from '../hooks/useWebSocket';
import useWebRTC from '../hooks/useWebRTC';

const PublicCallPage = () => {
    const { userId } = useParams();
    const [cardData, setCardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Call States: 'idle', 'calling', 'incall', 'declined', 'ended'
    const [callState, setCallState] = useState('idle');
    const [callId, setCallId] = useState(null);

    console.log('PublicCallPage rendering with userId:', userId);
    const { status: wsStatus, lastMessage, sendMessage } = useWebSocket('ws://localhost:3001', userId);

    // WebRTC Logic
    const {
        localStream,
        remoteStream,
        isMuted,
        toggleMute,
        initializePeerConnection,
        cleanup
    } = useWebRTC(wsStatus, sendMessage, lastMessage);

    const remoteAudioRef = useRef(null);

    // Auto-play remote stream when available
    useEffect(() => {
        if (remoteStream && remoteAudioRef.current) {
            console.log('Attaching remote stream to audio element');
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.play().catch(e => console.error('Error playing remote audio:', e));
        }
    }, [remoteStream]);


    const fetchCardData = async () => {
        try {
            // Fetch directly from the public endpoint
            const response = await api.get(`/public/instant-call/${userId}`);
            setCardData(response.data);
            setError(null);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 404) {
                setError('User not found or instant call not configured.');
            } else {
                setError('Failed to load profile.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchCardData();
        }
    }, [userId]);

    useEffect(() => {
        if (lastMessage) {
            switch (lastMessage.type) {
                case 'call-accepted':
                    setCallState('incall');
                    setCallId(lastMessage.callId);
                    // Initiate WebRTC Call as the Caller (initiator = true)
                    initializePeerConnection(true);
                    break;
                case 'call-declined':
                    setCallState('declined');
                    cleanup();
                    setTimeout(() => setCallState('idle'), 3000);
                    break;
                case 'call-ended':
                    setCallState('ended');
                    cleanup();
                    setTimeout(() => setCallState('idle'), 3000);
                    break;
                case 'call-error':
                    alert(lastMessage.message);
                    setCallState('idle');
                    cleanup();
                    break;
                default:
                    break;
            }
        }
    }, [lastMessage, initializePeerConnection, cleanup]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'busy': return 'bg-yellow-500';
            case 'offline': return 'bg-gray-400';
            default: return 'bg-gray-400';
        }
    };

    const handleCall = async () => {
        if (wsStatus !== 'connected') {
            alert('Connection to server lost. Please refresh.');
            return;
        }

        const visitorName = prompt("Please enter your name to call:") || "Anonymous Guest";

        setCallState('calling');
        sendMessage({
            type: 'call-request',
            hostId: userId,
            visitorName,
            visitorEmail: '', // Optional
            timestamp: new Date().toISOString()
        });
    };

    const handleEndCall = () => {
        sendMessage({ type: 'call-end', callId });
        setCallState('idle');
        cleanup();
    };

    const handleToggleMute = () => {
        toggleMute();
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !cardData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="text-red-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Unavailable</h2>
                    <p className="text-gray-600">{error || 'This user does not exist or has not set up their profile.'}</p>
                </div>
            </div>
        );
    }

    const { name, bio, status, profileImage, settings } = cardData;

    // Use saved settings or defaults
    const textColor = settings?.textColor || '#1f2937';
    const backgroundColor = settings?.backgroundColor || '#ffffff';
    const buttonColor = settings?.buttonColor || '#2563eb';
    const buttonTextColor = settings?.buttonTextColor || '#ffffff';

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="flex flex-col items-center">
                <div
                    className="relative w-80 md:w-96 min-h-[500px] rounded-3xl shadow-2xl p-8 flex flex-col items-center transition-all duration-300 overflow-hidden bg-white"
                    style={{ backgroundColor, color: textColor }}
                >
                    {/* Status Badge */}
                    <div className="absolute top-6 left-6 flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/10">
                        <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status)} shadow-[0_0_8px_rgba(0,0,0,0.3)]`}></div>
                        <span className="text-xs font-semibold tracking-wide uppercase opacity-90">{status}</span>
                    </div>

                    {/* Connection Indicator */}
                    <div className="absolute top-6 right-6 flex items-center bg-white/20 backdrop-blur-md rounded-full px-2 py-1" title={wsStatus === 'connected' ? 'Connected to Call Server' : 'Disconnected'}>
                        <div className={`w-2 h-2 rounded-full ${wsStatus === 'connected' ? 'bg-green-400' : 'bg-red-500 animate-pulse'}`}></div>
                    </div>


                    {/* Profile Image */}
                    <div className="mt-10 mb-6 relative group">
                        <div className="absolute inset-0 bg-white/30 rounded-full blur-xl transform group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="w-40 h-40 rounded-full p-1.5 bg-white/20 backdrop-blur-sm shadow-inner relative z-10">
                            <img
                                src={profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                                alt={name}
                                className="w-full h-full rounded-full object-cover shadow-md"
                            />
                        </div>
                    </div>

                    {/* Name & Bio */}
                    <h1 className="text-3xl font-bold text-center mb-3 px-2 leading-tight">{name}</h1>
                    <p className="text-base text-center leading-relaxed mb-8 opacity-80 px-4 font-light flex-grow">
                        {bio || 'Ready to connect.'}
                    </p>

                    {/* Call Status Overlays */}
                    {callState === 'calling' && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
                            <div className="w-20 h-20 rounded-full border-4 border-white/30 border-t-white animate-spin mb-6"></div>
                            <h3 className="text-xl font-semibold mb-2">Calling {name}...</h3>
                            <p className="text-sm opacity-60 mb-8">Waiting for response</p>
                            <button
                                onClick={handleEndCall}
                                className="p-4 bg-red-500 rounded-full hover:bg-red-600 transition-transform hover:scale-110"
                            >
                                <PhoneOff size={28} />
                            </button>
                        </div>
                    )}

                    {callState === 'incall' && (
                        <div className="absolute inset-0 bg-gray-900 z-50 flex flex-col items-center justify-between py-12 text-white">
                            <div className="text-center">
                                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-green-500">
                                    <img src={profileImage} alt={name} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="text-2xl font-bold">{name}</h3>
                                <p className="text-green-400 animate-pulse">00:00 (Connected)</p>
                            </div>

                            <div className="flex items-center space-x-6">
                                {/* Remote Audio Element */}
                                <audio ref={remoteAudioRef} autoPlay />

                                <button
                                    onClick={handleToggleMute}
                                    className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} hover:opacity-90 transition-all`}
                                >
                                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                                </button>

                                <button
                                    onClick={handleEndCall}
                                    className="p-5 bg-red-600 rounded-full hover:bg-red-700 shadow-lg transform hover:scale-105"
                                >
                                    <PhoneOff size={32} />
                                </button>
                                <button className="p-4 bg-gray-700 rounded-full hover:bg-gray-600"><Video size={24} /></button>
                            </div>
                        </div>
                    )}

                    {callState === 'declined' && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
                            <PhoneOff size={48} className="text-red-500 mb-4" />
                            <h3 className="text-xl font-bold">Call Declined</h3>
                        </div>
                    )}

                    {callState === 'ended' && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
                            <PhoneOff size={48} className="text-gray-400 mb-4" />
                            <h3 className="text-xl font-bold">Call Ended</h3>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="w-full space-y-3 mt-auto mb-6">
                        <button
                            onClick={handleCall}
                            disabled={status === 'offline' || callState !== 'idle' || wsStatus !== 'connected'}
                            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${status === 'offline' || wsStatus !== 'connected' ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-xl hover:-translate-y-1'
                                }`}
                            style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                        >
                            {wsStatus !== 'connected' ? (
                                <span className="animate-pulse">Connecting...</span>
                            ) : (
                                <>
                                    <Phone size={22} className="mr-3" />
                                    {status === 'offline' ? 'Offline' : 'Call Now'}
                                </>
                            )}
                        </button>


                    </div>

                    {/* Footer */}
                    <div className="text-[10px] font-medium opacity-40 uppercase tracking-widest mt-2 flex items-center">
                        Powered by Blue
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicCallPage;
