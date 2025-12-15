import { useRef, useState, useCallback, useEffect } from 'react';

const useWebRTC = (wsStatus, sendMessage, lastMessage) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);

    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);

    const cleanup = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        setLocalStream(null);
        setRemoteStream(null);
    }, []);

    const initializePeerConnection = useCallback(async (isInitiator) => {
        try {
            console.log('Initializing PeerConnection, isInitiator:', isInitiator);

            // 1. Get User Media
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            localStreamRef.current = stream;
            setLocalStream(stream);

            // 2. Create Peer Connection
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });
            peerConnectionRef.current = pc;

            // 3. Add Tracks
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            // 4. Handle Remote Stream
            pc.ontrack = (event) => {
                console.log('Received remote track');
                setRemoteStream(event.streams[0]);
            };

            // 5. Handle ICE Candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    sendMessage({
                        type: 'ice-candidate',
                        candidate: event.candidate
                    });
                }
            };

            // 6. Create Offer (if initiator)
            if (isInitiator) {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                sendMessage({ type: 'webrtc-offer', offer });
            }

        } catch (err) {
            console.error('Error initializing WebRTC:', err);
            // Handle error (notify user)
            alert('Could not access microphone or initialize call.');
        }
    }, [sendMessage]);

    // Handle Signaling Messages
    useEffect(() => {
        if (!lastMessage) return;

        const pc = peerConnectionRef.current;
        const handleSignaling = async () => {
            if (lastMessage.type === 'webrtc-offer' && pc) {
                console.log('Received Offer');
                await pc.setRemoteDescription(new RTCSessionDescription(lastMessage.offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                sendMessage({ type: 'webrtc-answer', answer });
            } else if (lastMessage.type === 'webrtc-answer' && pc) {
                console.log('Received Answer');
                await pc.setRemoteDescription(new RTCSessionDescription(lastMessage.answer));
            } else if (lastMessage.type === 'ice-candidate' && pc) {
                console.log('Received ICE Candidate');
                try {
                    await pc.addIceCandidate(lastMessage.candidate);
                } catch (e) {
                    console.error('Error adding ice candidate', e);
                }
            }
        };

        handleSignaling();

    }, [lastMessage, sendMessage]);

    const toggleMute = useCallback(() => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    }, []);

    return {
        localStream,
        remoteStream,
        isMuted,
        toggleMute,
        initializePeerConnection,
        cleanup
    };
};

export default useWebRTC;
