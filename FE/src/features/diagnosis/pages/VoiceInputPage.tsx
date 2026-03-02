import { useEffect, useRef, useState } from "react";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";
import { Mic, Square } from "lucide-react";
import { BackButton } from "../../../shared/layout/BackButton";
import {
  buildVoiceWebFile,
  clearStagedVoiceRecording,
  getStagedVoiceRecordingFile,
  getStagedVoiceRecordingMeta,
  stageVoiceRecording,
  type StagedVoiceRecordingMeta,
} from "../lib/voiceRecording";

interface VoiceInputPageProps {
  onNext?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  onHome?: () => void;
}

export function VoiceInputPage({ onNext, onSkip, onBack, onHome }: VoiceInputPageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isRecorderStopping, setIsRecorderStopping] = useState(false);
  const [hasRecording, setHasRecording] = useState(Boolean(getStagedVoiceRecordingMeta()));
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [recordingMeta, setRecordingMeta] = useState<StagedVoiceRecordingMeta | null>(
    getStagedVoiceRecordingMeta()
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingTimeRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserDataRef = useRef<Uint8Array | null>(null);
  const levelAnimationRef = useRef<number | null>(null);
  const saveOnStopRef = useRef(true);
  const playbackUrlRef = useRef<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const replacePlaybackUrl = (file: File | null) => {
    if (playbackUrlRef.current) {
      URL.revokeObjectURL(playbackUrlRef.current);
      playbackUrlRef.current = null;
    }

    if (!file) {
      setPlaybackUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    playbackUrlRef.current = nextUrl;
    setPlaybackUrl(nextUrl);
  };

  useEffect(() => {
    if (recordingMeta && !getStagedVoiceRecordingFile()) {
      // Prevent stale UI state after a full page refresh.
      clearStagedVoiceRecording();
      setRecordingMeta(null);
      setHasRecording(false);
      replacePlaybackUrl(null);
    }
  }, [recordingMeta]);

  useEffect(() => {
    const stagedFile = getStagedVoiceRecordingFile();
    if (stagedFile) {
      replacePlaybackUrl(stagedFile);
      setHasRecording(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      saveOnStopRef.current = false;
      if (mediaRecorderRef.current?.state === "recording") {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      stopAudioLevelMonitor();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (playbackUrlRef.current) {
        URL.revokeObjectURL(playbackUrlRef.current);
        playbackUrlRef.current = null;
      }
    };
  }, []);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopAudioLevelMonitor = () => {
    if (levelAnimationRef.current) {
      cancelAnimationFrame(levelAnimationRef.current);
      levelAnimationRef.current = null;
    }

    try {
      sourceNodeRef.current?.disconnect();
      analyserRef.current?.disconnect();
    } catch {
      // ignore
    }

    sourceNodeRef.current = null;
    analyserRef.current = null;
    analyserDataRef.current = null;

    const context = audioContextRef.current;
    audioContextRef.current = null;
    if (context && context.state !== "closed") {
      void context.close();
    }

    setAudioLevel(0);
  };

  const startAudioLevelMonitor = (stream: MediaStream) => {
    stopAudioLevelMonitor();

    const AudioContextCtor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    const context = new AudioContextCtor();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.85;
    const source = context.createMediaStreamSource(stream);
    source.connect(analyser);

    audioContextRef.current = context;
    analyserRef.current = analyser;
    sourceNodeRef.current = source;
    analyserDataRef.current = new Uint8Array(analyser.fftSize);

    const updateLevel = () => {
      const data = analyserDataRef.current;
      const node = analyserRef.current;
      if (!data || !node) return;

      node.getByteTimeDomainData(data);
      let squareSum = 0;
      for (let i = 0; i < data.length; i += 1) {
        const value = (data[i] - 128) / 128;
        squareSum += value * value;
      }

      const rms = Math.sqrt(squareSum / data.length);
      const normalized = Math.min(1, rms * 3.4);
      setAudioLevel((prev) => prev * 0.4 + normalized * 0.6);
      levelAnimationRef.current = requestAnimationFrame(updateLevel);
    };

    levelAnimationRef.current = requestAnimationFrame(updateLevel);
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const finalizeRecording = (recorderMimeType?: string) => {
    const fallbackMimeType = recorderMimeType || "audio/webm";
    const voiceBlob = new Blob(audioChunksRef.current, { type: fallbackMimeType });
    audioChunksRef.current = [];

    if (voiceBlob.size === 0) {
      setHasRecording(false);
      setRecordingMeta(null);
      setError("녹음 파일을 만들지 못했습니다. 다시 시도해 주세요.");
      clearStagedVoiceRecording();
      return;
    }

    const voiceFile = buildVoiceWebFile(voiceBlob);
    const meta = stageVoiceRecording(voiceFile, recordingTimeRef.current);
    setRecordingMeta(meta);
    setHasRecording(true);
    setError(null);
    replacePlaybackUrl(voiceFile);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("이 브라우저는 녹음을 지원하지 않습니다.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startAudioLevelMonitor(stream);

      const preferredMimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
      const supportedMimeType = preferredMimeTypes.find((type) =>
        MediaRecorder.isTypeSupported(type)
      );
      const recorder = supportedMimeType
        ? new MediaRecorder(stream, { mimeType: supportedMimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      saveOnStopRef.current = true;
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      recorder.onerror = () => {
        stopTimer();
        stopAudioLevelMonitor();
        stopStream();
        setIsRecording(false);
        setIsRecorderStopping(false);
        setError("녹음 중 오류가 발생했습니다. 다시 시도해 주세요.");
      };
      recorder.onstop = () => {
        stopTimer();
        stopAudioLevelMonitor();
        stopStream();
        setIsRecording(false);
        setIsRecorderStopping(false);

        if (!saveOnStopRef.current) {
          audioChunksRef.current = [];
          return;
        }

        finalizeRecording(recorder.mimeType);
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setIsRecorderStopping(false);
      setRecordingTime(0);
      recordingTimeRef.current = 0;
      setError(null);

      stopTimer();
      timerRef.current = setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime(recordingTimeRef.current);
      }, 1000);
    } catch {
      stopAudioLevelMonitor();
      stopStream();
      setError("마이크 접근에 실패했습니다. 브라우저 권한을 확인해 주세요.");
    }
  };

  const stopRecording = ({ save = true }: { save?: boolean } = {}) => {
    saveOnStopRef.current = save;
    stopTimer();

    const recorder = mediaRecorderRef.current;
    if (recorder?.state === "recording") {
      setIsRecorderStopping(true);
      try {
        recorder.requestData();
      } catch {
        // ignore
      }
      recorder.stop();
      return;
    }

    setIsRecording(false);
    setIsRecorderStopping(false);
    audioChunksRef.current = [];
    stopAudioLevelMonitor();
    stopStream();
  };

  const handleRecordToggle = async () => {
    if (isRecording || isRecorderStopping) {
      stopRecording({ save: true });
      return;
    }

    await startRecording();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSkip = () => {
    if (isRecording || isRecorderStopping) {
      stopRecording({ save: false });
    }
    stopAudioLevelMonitor();
    clearStagedVoiceRecording();
    setHasRecording(false);
    setRecordingMeta(null);
    setRecordingTime(0);
    recordingTimeRef.current = 0;
    replacePlaybackUrl(null);
    setError(null);
    onSkip?.();
  };

  const handleRetryRecording = async () => {
    if (isRecording || isRecorderStopping) return;

    clearStagedVoiceRecording();
    setHasRecording(false);
    setRecordingMeta(null);
    setRecordingTime(0);
    recordingTimeRef.current = 0;
    replacePlaybackUrl(null);
    setError(null);
    await startRecording();
  };

  const handleDownloadVoice = () => {
    const stagedFile = getStagedVoiceRecordingFile();
    if (!stagedFile) {
      setError("저장된 음성 파일이 없습니다. 다시 녹음해 주세요.");
      return;
    }

    const url = URL.createObjectURL(stagedFile);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = stagedFile.name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto">
      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
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

        <div className="w-full max-w-[300px] h-[52px] mb-6 flex items-end justify-center gap-[3px]">
          {Array.from({ length: 24 }).map((_, index) => {
            const baseHeight = 6;
            const activeLevel = Math.max(audioLevel, 0.02);
            const phase = Date.now() / 140 + index * 0.55;
            const swing = Math.abs(Math.sin(phase));
            const peak = isRecording ? 34 : 18;
            const dynamicHeight = baseHeight + peak * (0.2 + activeLevel * swing * 1.5);
            const barHeight = Math.max(baseHeight, Math.min(40, dynamicHeight));
            const opacity = isRecording ? 0.35 + activeLevel * 0.65 : hasRecording ? 0.55 : 0.2;

            return (
              <div
                key={`voice-bar-${index}`}
                className="w-[4px] rounded-full bg-[#EF466F] transition-all duration-100"
                style={{ height: `${barHeight}px`, opacity }}
              />
            );
          })}
        </div>

        {/* Recording Button */}
        <div className="relative mb-12">
          <button
            onClick={handleRecordToggle}
            disabled={isRecorderStopping}
            className={`relative w-[160px] h-[160px] rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              isRecording
                ? "bg-[#EF466F] animate-pulse-ring"
                : hasRecording
                ? "bg-gradient-to-br from-[#4ECDC4] to-[#44A08D]"
                : "bg-gradient-to-br from-[#f8f8f8] to-[#e0e0e0] hover:scale-105"
            } ${isRecorderStopping ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {isRecording ? (
              <Square className="w-12 h-12 text-white fill-white" />
            ) : (
              <Mic className={`w-14 h-14 ${hasRecording ? "text-white" : "text-[#6b6b6b]"}`} />
            )}
          </button>
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-4 border-[#EF466F] animate-ping opacity-75" />
          )}
        </div>

        {/* Status */}
        <div className="text-center mb-20 min-h-[130px]">
          {error ? (
            <div className="space-y-2">
              <p className="font-['Noto_Sans_KR'] font-medium text-[15px] text-[#EF466F]">
                {error}
              </p>
            </div>
          ) : isRecorderStopping ? (
            <div className="space-y-2">
              <p className="font-['Noto_Sans_KR'] font-semibold text-[16px] text-[#EF466F]">
                녹음을 정리하는 중...
              </p>
              <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b]">
                잠시만 기다려 주세요
              </p>
            </div>
          ) : isRecording ? (
            <div className="space-y-2">
              <p className="font-['Noto_Sans_KR'] font-semibold text-[16px] text-[#EF466F]">
                녹음 중...
              </p>
              <p className="font-['Noto_Sans_KR'] text-[12px] text-[#6b6b6b]">
                {audioLevel > 0.05 ? "마이크 입력 감지됨" : "마이크 입력 대기 중"}
              </p>
              <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b]">
                {formatTime(recordingTime)}
              </p>
              <button
                type="button"
                onClick={() => stopRecording({ save: true })}
                className="font-['Noto_Sans_KR'] text-[13px] text-[#262626] underline mt-1"
              >
                정지
              </button>
            </div>
          ) : hasRecording ? (
            <div className="space-y-1">
              <p className="font-['Noto_Sans_KR'] font-semibold text-[16px] text-[#44A08D]">
                녹음 완료!
              </p>
              {recordingMeta ? (
                <>
                  <p className="font-['Noto_Sans_KR'] text-[12px] text-[#6b6b6b] break-all px-4">
                    {recordingMeta.fileName}
                  </p>
                  <p className="font-['Noto_Sans_KR'] text-[12px] text-[#6b6b6b]">
                    {formatBytes(recordingMeta.size)} / {formatTime(recordingMeta.durationSec)}
                  </p>
                  {playbackUrl ? (
                    <audio controls src={playbackUrl} className="w-full max-w-[290px] mx-auto mt-2" />
                  ) : null}
                  <button
                    type="button"
                    onClick={handleDownloadVoice}
                    className="font-['Noto_Sans_KR'] text-[12px] text-[#1f6feb] underline mt-1"
                  >
                    .web 파일 저장 확인
                  </button>
                  <button
                    type="button"
                    onClick={handleRetryRecording}
                    className="font-['Noto_Sans_KR'] text-[13px] text-[#262626] underline mt-1"
                  >
                    다시 녹음하기
                  </button>
                </>
              ) : (
                <p className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b]">
                  다시 녹음하려면 버튼을 누르세요
                </p>
              )}
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
            onClick={handleSkip}
            disabled={isRecorderStopping}
            className="bg-[#f0f0f0] rounded-[16px] h-[56px] px-8 font-['Noto_Sans_KR'] font-medium text-[15px] text-[#262626] hover:bg-[#e5e5e5] transition-colors"
          >
            건너뛰기
          </button>
          <button
            onClick={onNext}
            disabled={isRecording || isRecorderStopping}
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


