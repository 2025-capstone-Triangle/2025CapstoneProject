import { useState, useRef } from 'react';
import { StatusBar } from '../../../shared/layout/StatusBar';
import { DefaultTopBar } from '../../../shared/layout/DefaultTopBar';
import { Mic, Square } from 'lucide-react';
import { BackButton } from '../../../shared/layout/BackButton';

interface VoiceInputPageProps {
  onNext?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  onHome?: () => void;
}

export function VoiceInputPage({ onNext, onSkip, onBack, onHome }: VoiceInputPageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleRecordToggle = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setIsRecording(false);
      setHasRecording(true);
      setError(null);
    } else {
      // Start recording
      try {
        // Check if mediaDevices is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.log('MediaDevices API not supported - using mock recording');
          startMockRecording();
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        const audioChunks: Blob[] = [];
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          console.log('Recording saved:', audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        setError(null);

        // Start timer
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.log('Microphone not available - using mock recording:', err);
        setError(null);
        startMockRecording();
      }
    }
  };

  const startMockRecording = () => {
    // Mock recording for demo purposes
    setIsRecording(true);
    setRecordingTime(0);
    setError(null);

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 3) {
          // Auto stop after 3 seconds in mock mode
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setIsRecording(false);
          setHasRecording(true);
          return 3;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto">      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />
      
      <div className="px-8 pt-16 flex flex-col items-center">
        {/* Instruction */}
        <div className="text-center mb-16">
          <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[24px] text-black mb-4">
            다음 문장을 따라 말해보세요
          </h2>
          <div className="h-[1px] w-[200px] bg-[#e0e0e0] mx-auto mb-6" />
          <p className="font-['Noto_Sans_KR'] text-[15px] text-[#6b6b6b] leading-[1.7]">
            "안녕하세요, 반갑습니다.<br />
            오늘 날씨가 정말 좋네요."
          </p>
        </div>

        {/* Recording Button */}
        <div className="relative mb-12">
          <button
            onClick={handleRecordToggle}
            className={`relative w-[160px] h-[160px] rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              isRecording 
                ? 'bg-[#EF466F] animate-pulse-ring' 
                : hasRecording
                ? 'bg-gradient-to-br from-[#4ECDC4] to-[#44A08D]'
                : 'bg-gradient-to-br from-[#f8f8f8] to-[#e0e0e0] hover:scale-105'
            }`}
          >
            {isRecording ? (
              <Square className="w-12 h-12 text-white fill-white" />
            ) : (
              <Mic className={`w-14 h-14 ${hasRecording ? 'text-white' : 'text-[#6b6b6b]'}`} />
            )}
          </button>
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-4 border-[#EF466F] animate-ping opacity-75" />
          )}
        </div>

        {/* Status */}
        <div className="text-center mb-20 h-16">
          {error ? (
            <div className="space-y-2">
              <p className="font-['Noto_Sans_KR'] font-medium text-[15px] text-[#EF466F]">
                {error}
              </p>
            </div>
          ) : isRecording ? (
            <div className="space-y-2">
              <p className="font-['Noto_Sans_KR'] font-semibold text-[16px] text-[#EF466F]">
                녹음 중...
              </p>
              <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b]">
                {formatTime(recordingTime)}
              </p>
            </div>
          ) : hasRecording ? (
            <div className="space-y-1">
              <p className="font-['Noto_Sans_KR'] font-semibold text-[16px] text-[#44A08D]">
                녹음 완료!
              </p>
              <p className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b]">
                다시 녹음하려면 버튼을 누르세요
              </p>
            </div>
          ) : (
            <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b]">
              버튼을 눌러 녹음을 시작하세요
            </p>
          )}
        </div>
      </div>

      {/* Fixed Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#f0f0f0] p-6 max-w-[390px] mx-auto">
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="bg-[#f0f0f0] rounded-[16px] h-[56px] px-8 font-['Noto_Sans_KR'] font-medium text-[15px] text-[#262626] hover:bg-[#e5e5e5] transition-colors"
          >
            건너뛰기
          </button>
          <button
            onClick={onNext}
            disabled={isRecording}
            className="flex-1 bg-black rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-colors"
          >
            다음
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 70, 111, 0.7);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(239, 70, 111, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 70, 111, 0);
          }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}


