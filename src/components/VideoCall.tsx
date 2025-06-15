
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Monitor,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface VideoCallProps {
  isCallActive: boolean;
  onStartCall: () => void;
  onEndCall: () => void;
  participants: Array<{ id: string; name: string }>;
}

const VideoCall = ({ isCallActive, onStartCall, onEndCall, participants }: VideoCallProps) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isCallActive) {
      startLocalVideo();
    } else {
      stopLocalVideo();
    }

    return () => {
      stopLocalVideo();
    };
  }, [isCallActive]);

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Failed to access camera/microphone');
    }
  };

  const stopLocalVideo = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        toast.success('Screen sharing started');
      } else {
        startLocalVideo();
        setIsScreenSharing(false);
        toast.success('Screen sharing stopped');
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      toast.error('Failed to share screen');
    }
  };

  const handleStartCall = () => {
    onStartCall();
    toast.success('Call started');
  };

  const handleEndCall = () => {
    stopLocalVideo();
    onEndCall();
    toast.success('Call ended');
  };

  if (!isCallActive) {
    return (
      <Card className="p-4 bg-slate-800 border-slate-700">
        <div className="text-center">
          <Video className="w-12 h-12 mx-auto mb-3 text-slate-400" />
          <h3 className="text-lg font-semibold text-white mb-2">Video Call</h3>
          <p className="text-slate-400 mb-4">Start a video call with participants</p>
          <Button onClick={handleStartCall} className="bg-green-600 hover:bg-green-700">
            <Video className="w-4 h-4 mr-2" />
            Start Call
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-slate-800 border-slate-700">
      <div className="space-y-4">
        {/* Local Video */}
        <div className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-48 bg-slate-900 rounded-lg object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            You
          </div>
        </div>

        {/* Participants Grid */}
        <div className="grid grid-cols-2 gap-2">
          {participants.slice(0, 4).map((participant) => (
            <div key={participant.id} className="relative">
              <div className="w-full h-24 bg-slate-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-1">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-white">{participant.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call Controls */}
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            variant={isAudioEnabled ? "default" : "destructive"}
            onClick={toggleAudio}
          >
            {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>
          
          <Button
            size="sm"
            variant={isVideoEnabled ? "default" : "destructive"}
            onClick={toggleVideo}
          >
            {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </Button>
          
          <Button
            size="sm"
            variant={isScreenSharing ? "secondary" : "outline"}
            onClick={toggleScreenShare}
          >
            <Monitor className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="destructive"
            onClick={handleEndCall}
          >
            <PhoneOff className="w-4 h-4" />
          </Button>
        </div>

        {/* Participant Count */}
        <div className="text-center text-sm text-slate-400">
          {participants.length + 1} participant{participants.length === 0 ? '' : 's'} in call
        </div>
      </div>
    </Card>
  );
};

export default VideoCall;
