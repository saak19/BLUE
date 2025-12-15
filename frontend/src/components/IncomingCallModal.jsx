import React, { useEffect, useState, useRef } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import useWebRTC from '../hooks/useWebRTC';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { getCurrentUser } from '../services/auth';

const IncomingCallModal = () => {
    const token = localStorage.getItem('token');
    const { status: wsStatus, lastMessage, sendMessage } = useWebSocket('ws://localhost:3001', { token });
    const [incomingCall, setIncomingCall] = useState(null);
    const [callActive, setCallActive] = useState(false);
    const [callId, setCallId] = useState(null);
    const audioRef = useRef(null);
    const remoteAudioRef = useRef(null);
    const [currentCall, setCurrentCall] = useState(null);

    const {
        localStream,
        remoteStream,
        isMuted,
        toggleMute,
        initializePeerConnection,
        cleanup
    } = useWebRTC(wsStatus, sendMessage, lastMessage);

    // Auto-play remote stream when available
    useEffect(() => {
        if (remoteStream && remoteAudioRef.current) {
            console.log('Attaching remote stream to audio element (Host)');
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.play().catch(e => console.error('Error playing remote audio:', e));
        }
    }, [remoteStream]);

    useEffect(() => {
        if (lastMessage) {
            console.log('Dashboard WS Message:', lastMessage);
            switch (lastMessage.type) {
                case 'incoming-call':
                    setIncomingCall(lastMessage.visitor);
                    setCallId(lastMessage.callId);
                    playRingtone();
                    break;
                case 'call-ended':
                    endCallCleanup();
                    break;
                default:
                    break;
            }
        }
    }, [lastMessage]);

    const playRingtone = () => {
        // Use a simple oscillator or predefined audio file
        // For simplicity, we'll try to use a local file or just log
        // Creating a simple beep sequence with Web Audio API if no file
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);

            oscillator.start();
            // Stop after 2 seconds repeatedly
            const interval = setInterval(() => {
                if (audioCtx.state === 'closed') clearInterval(interval);
                // Rescheduling beeps could be complex, for now continuous tone until interaction
            }, 1000);

            audioRef.current = { ctx: audioCtx, osc: oscillator, interval };
        } catch (e) {
            console.error('Audio play failed', e);
        }
    };

    const stopRingtone = () => {
        if (audioRef.current) {
            try {
                audioRef.current.osc.stop();
                audioRef.current.ctx.close();
            } catch (e) { }
            audioRef.current = null;
        }
    };

    // Removed endCallCleanup as it's replaced by cleanup from useWebRTC and local state resets

    const handleAccept = async () => { // Renamed from handleAnswer
        if (incomingCall) {
            stopRingtone();
            const callId = incomingCall.callId;
            setCurrentCall(incomingCall); // Set currentCall to the incoming call details
            setIncomingCall(null); // Clear incoming call state

            // Notify server
            sendMessage({ type: 'call-answer', callId });

            // Initialize WebRTC as Receiver (initiator = false)
            await initializePeerConnection(false);
        }
    };

    const handleDecline = () => {
        if (incomingCall) {
            stopRingtone();
            sendMessage({ type: 'call-decline', callId: incomingCall.callId }); // Use incomingCall.callId
            setIncomingCall(null);
            // setCallId(null); // No longer needed
        }
    };

    const handleEndCall = () => {
        sendMessage({ type: 'call-end' });
        setCurrentCall(null); // Clear current call state
        cleanup(); // Call WebRTC cleanup
    };

    const handleToggleMute = () => {
        toggleMute();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            {/* Hidden Audio for Remote Stream */}
            <audio ref={remoteAudioRef} autoPlay />

            {/* Incoming Call UI */}
            {incomingCall && (
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center animate-bounce-in">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Phone size={32} className="text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{incomingCall.visitor.name}</h3>
                    <p className="text-sm text-gray-500 mb-6">Incoming Call...</p>

                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={handleDecline}
                            className="p-4 bg-red-500 rounded-full text-white hover:bg-red-600 transition-transform hover:scale-110 shadow-lg"
                        >
                            <PhoneOff size={24} />
                        </button>
                        <button
                            onClick={handleAccept}
                            className="p-4 bg-green-500 rounded-full text-white hover:bg-green-600 transition-transform hover:scale-110 shadow-lg"
                        >
                            <Phone size={24} />
                        </button>
                    </div>
                </div>
            )}

            {/* Active Call UI */}
            {currentCall && (
                <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-96 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x"></div>

                    <div className="w-24 h-24 rounded-full border-4 border-green-400 mx-auto mb-4 overflow-hidden">
                        {/* Placeholder for visitor image, maybe use dicebear with name */}
                        <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentCall.visitor.name}`}
                            alt={currentCall.visitor.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <h3 className="text-2xl font-bold mb-2">{currentCall.visitor.name}</h3>
                    <p className="text-green-400 mb-8 font-mono">Connected</p>

                    <div className="flex justify-center space-x-6">
                        <button
                            onClick={handleToggleMute}
                            className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} hover:opacity-90 transition-all`}
                        >
                            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>

                        <button
                            onClick={handleEndCall}
                            className="p-5 bg-red-600 rounded-full hover:bg-red-700 shadow-xl transform hover:scale-105 border-4 border-red-800"
                        >
                            <PhoneOff size={32} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncomingCallModal;
