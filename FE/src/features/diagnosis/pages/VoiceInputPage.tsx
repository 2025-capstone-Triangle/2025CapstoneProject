import { useEffect, useRef, useState } from "react";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";
import { BackButton } from "../../../shared/layout/BackButton";
import { CheckCircle2, Circle, Mic, Pause, Play, RefreshCw, Square } from "lucide-react";
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

const MAX_RECORDING_SECONDS = 90;
const SAMPLE_SCRIPT = "안녕하세요, 반갑습니다. 오늘 날씨가 정말 좋네요.";

export function VoiceInputPage({ onNext, onSkip, onBack, onHome }: VoiceInputPageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecorderStopping, setIsRecorderStopping] = useState(false);
  const [hasRecording, setHasRecording] = useState(Boolean(getStagedVoiceRecordingMeta()));
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveTick, setWaveTick] = useState(0);
  const [microphonePermission, setMicrophonePermission] = useState<
    "unknown" | "prompt" | "granted" | "denied"
  >("unknown");
  const [error, setError] = useState<string | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [recordingMeta, setRecordingMeta] = useState<StagedVoiceRecordingMeta | null>(
    getStagedVoiceRecordingMeta()
  );
  const [isPlaybackPlaying, setIsPlaybackPlaying] = useState(false);
  const [playbackCurrentSec, setPlaybackCurrentSec] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimeRef = useRef(0);
  const recordingStartedAtRef = useRef<number | null>(null);
  const accumulatedRecordingMsRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserDataRef = useRef<Uint8Array | null>(null);
  const levelAnimationRef = useRef<number | null>(null);
  const saveOnStopRef = useRef(true);
  const playbackUrlRef = useRef<string | null>(null);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  function replacePlaybackUrl(file: File | null) {
    if (playbackUrlRef.current) {
      URL.revokeObjectURL(playbackUrlRef.current);
      playbackUrlRef.current = null;
    }

    if (!file) {
      setPlaybackUrl(null);
      setIsPlaybackPlaying(false);
      setPlaybackCurrentSec(0);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    playbackUrlRef.current = nextUrl;
    setPlaybackUrl(nextUrl);
    setIsPlaybackPlaying(false);
    setPlaybackCurrentSec(0);
  }

  function stopTimer() {
    // timer loop is controlled by recording effect
  }

  function stopAudioLevelMonitor() {
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
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function clearRecordedClip() {
    clearStagedVoiceRecording();
    setHasRecording(false);
    setRecordingMeta(null);
    setRecordingTime(0);
    recordingTimeRef.current = 0;
    recordingStartedAtRef.current = null;
    accumulatedRecordingMsRef.current = 0;
    replacePlaybackUrl(null);
  }

  function getCurrentDurationMs() {
    const activeMs =
      recordingStartedAtRef.current !== null ? performance.now() - recordingStartedAtRef.current : 0;
    return accumulatedRecordingMsRef.current + activeMs;
  }

  function commitActiveDuration() {
    if (recordingStartedAtRef.current === null) return;
    accumulatedRecordingMsRef.current += performance.now() - recordingStartedAtRef.current;
    recordingStartedAtRef.current = null;
  }

  function stopRecording({ save = true }: { save?: boolean } = {}) {
    saveOnStopRef.current = save;
    stopTimer();

    const recorder = mediaRecorderRef.current;
    if (recorder?.state === "recording" || recorder?.state === "paused") {
      commitActiveDuration();
      const liveSeconds = Math.floor(getCurrentDurationMs() / 1000);
      recordingTimeRef.current = liveSeconds;
      setRecordingTime(liveSeconds);

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
    setIsPaused(false);
    setIsRecorderStopping(false);
    audioChunksRef.current = [];
    stopAudioLevelMonitor();
    stopStream();
  }

  function startAudioLevelMonitor(stream: MediaStream) {
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
  }

  async function getBlobDurationSec(blob: Blob) {
    const url = URL.createObjectURL(blob);
    return await new Promise<number | null>((resolve) => {
      const audio = document.createElement("audio");
      let settled = false;

      const cleanup = () => {
        if (settled) return;
        settled = true;
        audio.removeAttribute("src");
        audio.load();
        URL.revokeObjectURL(url);
      };

      audio.preload = "metadata";
      audio.onloadedmetadata = () => {
        const duration = Number.isFinite(audio.duration) ? audio.duration : NaN;
        cleanup();
        resolve(duration > 0 ? Math.ceil(duration) : null);
      };
      audio.onerror = () => {
        cleanup();
        resolve(null);
      };
      audio.src = url;
    });
  }

  async function finalizeRecording(recorderMimeType?: string) {
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
    const fallbackDurationSec = Math.max(1, Math.ceil(getCurrentDurationMs() / 1000));
    const measuredDurationSec = await getBlobDurationSec(voiceBlob);
    const durationSec = measuredDurationSec ?? fallbackDurationSec;
    recordingTimeRef.current = durationSec;
    setRecordingTime(durationSec);
    const meta = stageVoiceRecording(voiceFile, durationSec);
    setRecordingMeta(meta);
    setHasRecording(true);
    setError(null);
    replacePlaybackUrl(voiceFile);
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("이 브라우저는 녹음을 지원하지 않습니다.");
      return;
    }

    try {
      clearRecordedClip();
      setError(null);
      setMicrophonePermission("granted");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
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
        setIsPaused(false);
        setIsRecorderStopping(false);
        setError("녹음 중 오류가 발생했습니다. 다시 시도해 주세요.");
      };

      recorder.onstop = () => {
        stopTimer();
        stopAudioLevelMonitor();
        stopStream();
        setIsRecording(false);
        setIsPaused(false);
        setIsRecorderStopping(false);
        recordingStartedAtRef.current = null;

        if (!saveOnStopRef.current) {
          audioChunksRef.current = [];
          return;
        }

        void finalizeRecording(recorder.mimeType);
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setIsPaused(false);
      setIsRecorderStopping(false);
      setRecordingTime(0);
      recordingTimeRef.current = 0;
      accumulatedRecordingMsRef.current = 0;
      recordingStartedAtRef.current = performance.now();
      setWaveTick(0);
    } catch (err) {
      stopAudioLevelMonitor();
      stopStream();
      setMicrophonePermission("denied");
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해 주세요."
          : "마이크 접근에 실패했습니다. 브라우저 권한을 확인해 주세요.";
      setError(message);
    }
  }

  function handlePauseResume() {
    if (isRecorderStopping) return;

    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    if (recorder.state === "recording") {
      recorder.pause();
      commitActiveDuration();
      const pausedSeconds = Math.floor(getCurrentDurationMs() / 1000);
      recordingTimeRef.current = pausedSeconds;
      setRecordingTime(pausedSeconds);
      setIsPaused(true);
      stopAudioLevelMonitor();
      return;
    }

    if (recorder.state === "paused") {
      recorder.resume();
      recordingStartedAtRef.current = performance.now();
      setIsPaused(false);
      if (streamRef.current) {
        startAudioLevelMonitor(streamRef.current);
      }
    }
  }

  async function handleRecordToggle() {
    if (isRecording || isPaused || isRecorderStopping) {
      stopRecording({ save: true });
      return;
    }

    await startRecording();
  }

  async function handleRetryRecording() {
    if (isRecording || isRecorderStopping) return;
    await startRecording();
  }

  function handleDownloadVoice() {
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
  }

  function handleSkip() {
    if (isRecording || isRecorderStopping) {
      stopRecording({ save: false });
    }
    stopAudioLevelMonitor();
    if (playbackAudioRef.current) {
      playbackAudioRef.current.pause();
      playbackAudioRef.current.currentTime = 0;
    }
    setIsPlaybackPlaying(false);
    setPlaybackCurrentSec(0);
    clearRecordedClip();
    setError(null);
    onSkip?.();
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  useEffect(() => {
    if (recordingMeta && !getStagedVoiceRecordingFile()) {
      clearStagedVoiceRecording();
      setRecordingMeta(null);
      setHasRecording(false);
      replacePlaybackUrl(null);
    }
  }, [recordingMeta]);

  useEffect(() => {
    if (!navigator.permissions?.query) return;

    let active = true;
    let permissionStatus: PermissionStatus | null = null;

    (async () => {
      try {
        permissionStatus = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        if (!active) return;
        setMicrophonePermission(permissionStatus.state);
        permissionStatus.onchange = () => {
          setMicrophonePermission(permissionStatus?.state ?? "unknown");
        };
      } catch {
        // ignore
      }
    })();

    return () => {
      active = false;
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, []);

  useEffect(() => {
    const stagedFile = getStagedVoiceRecordingFile();
    if (stagedFile) {
      replacePlaybackUrl(stagedFile);
      setHasRecording(true);
    }
  }, []);

  useEffect(() => {
    if (!(isRecording && !isPaused)) return;
    const intervalId = window.setInterval(() => {
      setWaveTick((prev) => prev + 1);
      const nextTime = Math.floor(getCurrentDurationMs() / 1000);
      if (nextTime !== recordingTimeRef.current) {
        recordingTimeRef.current = nextTime;
        setRecordingTime(nextTime);
      }
      if (nextTime >= MAX_RECORDING_SECONDS) {
        stopRecording({ save: true });
      }
    }, 90);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRecording, isPaused]);

  useEffect(() => {
    if (!playbackUrl || !playbackAudioRef.current) return;
    const audio = playbackAudioRef.current;

    const handleTimeUpdate = () => {
      setPlaybackCurrentSec(Math.floor(audio.currentTime || 0));
    };

    const handleEnded = () => {
      setIsPlaybackPlaying(false);
      setPlaybackCurrentSec(0);
      audio.currentTime = 0;
    };
    const handlePause = () => {
      setIsPlaybackPlaying(false);
    };
    const handlePlay = () => {
      setIsPlaybackPlaying(true);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, [playbackUrl]);

  useEffect(() => {
    return () => {
      stopTimer();
      saveOnStopRef.current = false;
      if (mediaRecorderRef.current?.state === "recording" || mediaRecorderRef.current?.state === "paused") {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      stopAudioLevelMonitor();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (playbackAudioRef.current) {
        playbackAudioRef.current.pause();
      }
      recordingStartedAtRef.current = null;
      if (playbackUrlRef.current) {
        URL.revokeObjectURL(playbackUrlRef.current);
        playbackUrlRef.current = null;
      }
    };
  }, []);

  const progressPercent = Math.min(100, (recordingTime / MAX_RECORDING_SECONDS) * 100);
  const isLiveRecording = isRecording && !isPaused;
  const permissionGuide =
    microphonePermission === "denied"
      ? "권한 거부됨"
      : microphonePermission === "granted"
      ? "권한 허용됨"
      : "권한 확인 필요";

  const statusText = isRecorderStopping
    ? "녹음 파일 정리 중..."
    : isLiveRecording
    ? "녹음 중"
    : isPaused
    ? "일시정지"
    : hasRecording
    ? "녹음 완료"
    : "녹음 대기";

  const waveformBars = Array.from({ length: 32 }).map((_, index) => {
    const base = hasRecording ? 8 : 6;
    const drive = isLiveRecording ? Math.max(audioLevel, 0.07) : hasRecording ? 0.15 : 0.04;
    const swing = Math.abs(Math.sin((waveTick + index * 1.7) * 0.45));
    const barHeight = Math.round(base + 38 * (0.25 + drive * swing));
    const opacity = isLiveRecording ? 0.35 + drive * 0.6 : hasRecording ? 0.45 : 0.18;
    return { barHeight: Math.max(8, Math.min(44, barHeight)), opacity };
  });

  function togglePlayback() {
    const audio = playbackAudioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play();
      setIsPlaybackPlaying(true);
    } else {
      audio.pause();
      setIsPlaybackPlaying(false);
    }
  }

  function seekPlayback(nextSeconds: number) {
    const audio = playbackAudioRef.current;
    if (!audio) return;
    audio.currentTime = nextSeconds;
    setPlaybackCurrentSec(Math.floor(nextSeconds));
  }

  return (
    <div className="bg-gradient-to-b from-[#f7f8fa] via-white to-white min-h-screen max-w-[390px] mx-auto pb-[108px]">
      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />

      <div className="px-6 pt-6">
        <div className="rounded-[20px] border border-[#eceff3] bg-white p-5 shadow-[0_10px_24px_rgba(0,0,0,0.05)] mb-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f3f4f6] px-3 py-1.5 mb-3">
            <Mic className="w-4 h-4 text-[#111827]" />
            <span className="font-['Noto_Sans_KR'] text-[12px] text-[#374151] font-semibold">Voice Recorder</span>
          </div>
          <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[23px] text-black mb-2">
            문장을 또렷하게 읽어주세요
          </h2>
          <p className="font-['Noto_Sans_KR'] text-[14px] text-[#505050] leading-[1.7]">
            "{SAMPLE_SCRIPT}"
          </p>
          <div className="mt-4 flex items-center justify-between rounded-[14px] border border-[#ededed] bg-[#fafafa] px-3 py-2">
            <div className="flex items-center gap-2">
              <Circle
                className={`w-3 h-3 ${
                  microphonePermission === "granted"
                    ? "fill-[#16a34a] text-[#16a34a]"
                    : microphonePermission === "denied"
                    ? "fill-[#d92d20] text-[#d92d20]"
                    : "fill-[#d0d0d0] text-[#d0d0d0]"
                }`}
              />
              <span className="font-['Noto_Sans_KR'] text-[12px] text-[#666]">마이크 상태: {permissionGuide}</span>
            </div>
            <span className="font-['Noto_Sans_KR'] text-[11px] text-[#888]">최대 {formatTime(MAX_RECORDING_SECONDS)}</span>
          </div>
        </div>

        {error && (
          <div className="rounded-[14px] border border-[#ffd3d1] bg-[#fff3f2] px-4 py-3 mb-4">
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#bb3b3b]">{error}</p>
          </div>
        )}

        <div className="rounded-[20px] border border-[#efefef] bg-white p-5 mb-4 shadow-[0_10px_22px_rgba(0,0,0,0.04)]">
          {hasRecording && recordingMeta ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="font-['Noto_Sans_KR'] text-[13px] text-[#333] font-semibold">녹음 상태</p>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#effaf3] px-2.5 py-1">
                  <Circle className="w-2.5 h-2.5 fill-[#199a58] text-[#199a58]" />
                  <span className="font-['Noto_Sans_KR'] text-[11px] text-[#199a58]">녹음 완료</span>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-3">
                <p className="font-['NEXON_Football_Gothic'] text-[28px] text-black">{formatTime(recordingMeta.durationSec)}</p>
                <p className="font-['Noto_Sans_KR'] text-[12px] text-[#888]">/ {formatTime(MAX_RECORDING_SECONDS)}</p>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#effaf3] px-3 py-1.5 mb-3">
                <CheckCircle2 className="w-4 h-4 text-[#199a58]" />
                <span className="font-['Noto_Sans_KR'] text-[12px] text-[#199a58] font-semibold">녹음 파일 준비 완료</span>
              </div>
              <p className="font-['Noto_Sans_KR'] text-[12px] text-[#666] break-all mb-1">{recordingMeta.fileName}</p>
              <div className="mb-3">
                <p className="font-['Noto_Sans_KR'] text-[12px] text-[#777]">파일 크기: {formatBytes(recordingMeta.size)}</p>
                <p className="font-['Noto_Sans_KR'] text-[12px] text-[#777]">총 길이: {formatTime(recordingMeta.durationSec)}</p>
              </div>
              <p className="font-['Noto_Sans_KR'] text-[12px] text-[#2f855a] bg-[#eefaf3] border border-[#d9f2e4] rounded-[10px] px-3 py-2 mb-3">
                이 녹음본은 <span className="font-semibold">다음 단계에 자동 반영</span>됩니다.
              </p>
              {playbackUrl ? (
                <div className="rounded-[12px] border border-[#ececec] bg-[#fafafa] p-3">
                  <audio ref={playbackAudioRef} src={playbackUrl} preload="metadata" className="hidden" />
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={togglePlayback}
                      className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center"
                    >
                      {isPlaybackPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <p className="font-['Noto_Sans_KR'] text-[12px] text-[#555]">
                      {formatTime(playbackCurrentSec)} / {formatTime(recordingMeta.durationSec)}
                    </p>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(recordingMeta.durationSec, 1)}
                    value={Math.min(playbackCurrentSec, recordingMeta.durationSec)}
                    onChange={(event) => seekPlayback(Number(event.target.value))}
                    className="w-full accent-[#EF466F]"
                  />
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleRetryRecording}
                  className="h-[42px] rounded-[12px] border border-[#e5e5e5] bg-white font-['Noto_Sans_KR'] text-[13px] text-[#222] inline-flex items-center justify-center gap-1.5 hover:bg-[#fafafa]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  다시 녹음
                </button>
                <button
                  type="button"
                  onClick={handleDownloadVoice}
                  className="h-[42px] rounded-[12px] bg-[#111] text-white font-['Noto_Sans_KR'] text-[13px] inline-flex items-center justify-center"
                >
                  파일 저장
                </button>
              </div>
            </>
          ) : isRecorderStopping ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="font-['Noto_Sans_KR'] text-[13px] text-[#333] font-semibold">녹음 상태</p>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f6f6] px-2.5 py-1">
                  <Circle className="w-2.5 h-2.5 fill-[#EF466F] text-[#EF466F]" />
                  <span className="font-['Noto_Sans_KR'] text-[11px] text-[#6b6b6b]">{statusText}</span>
                </div>
              </div>
              <div className="h-[122px] flex flex-col items-center justify-center text-center">
                <p className="font-['Noto_Sans_KR'] text-[15px] text-[#EF466F] font-semibold mb-1">녹음 파일을 정리하고 있어요</p>
                <p className="font-['Noto_Sans_KR'] text-[12px] text-[#666]">잠시만 기다리면 자동으로 완료됩니다.</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="font-['Noto_Sans_KR'] text-[13px] text-[#333] font-semibold">녹음 상태</p>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f6f6] px-2.5 py-1">
                  <Circle
                    className={`w-2.5 h-2.5 ${
                      isLiveRecording ? "fill-[#EF466F] text-[#EF466F]" : "fill-[#bcbcbc] text-[#bcbcbc]"
                    }`}
                  />
                  <span className="font-['Noto_Sans_KR'] text-[11px] text-[#6b6b6b]">{statusText}</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <p className="font-['NEXON_Football_Gothic'] text-[30px] text-black">{formatTime(recordingTime)}</p>
                <p className="font-['Noto_Sans_KR'] text-[12px] text-[#888]">/ {formatTime(MAX_RECORDING_SECONDS)}</p>
              </div>

              <div className="h-[8px] rounded-full bg-[#f0f0f0] overflow-hidden mb-4">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#EF466F] to-[#ff7a93] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="h-[52px] mb-4 flex items-end justify-center gap-[3px]">
                {waveformBars.map((bar, index) => {
                  const isCenter = index > 10 && index < 22;
                  const width = isCenter ? 4 : 3;
                  return (
                    <div
                      key={`voice-bar-${index}`}
                      className="rounded-full bg-[#EF466F] transition-all duration-100"
                      style={{ width: `${width}px`, height: `${bar.barHeight}px`, opacity: bar.opacity }}
                    />
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleRecordToggle}
                  disabled={isRecorderStopping}
                  className={`h-[48px] rounded-[14px] font-['Noto_Sans_KR'] font-semibold text-[14px] inline-flex items-center justify-center gap-2 transition-colors ${
                    isRecording || isPaused
                      ? "bg-[#111] text-white hover:bg-black"
                      : "bg-[#EF466F] text-white hover:bg-[#de3c66]"
                  } disabled:opacity-50`}
                >
                  {isRecording || isPaused ? <Square className="w-4 h-4 fill-white" /> : <Mic className="w-4 h-4" />}
                  {isRecording || isPaused ? "녹음 종료" : "녹음 시작"}
                </button>
                <button
                  type="button"
                  onClick={handlePauseResume}
                  disabled={!isRecording || isRecorderStopping}
                  className="h-[48px] rounded-[14px] border border-[#dedede] bg-white font-['Noto_Sans_KR'] font-semibold text-[14px] text-[#222] inline-flex items-center justify-center gap-2 hover:bg-[#f8f8f8] disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? "재개" : "일시정지"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-[#f0f0f0] p-4 max-w-[390px] mx-auto">
        <p className="font-['Noto_Sans_KR'] text-[11px] text-[#666] mb-2 px-1">
          {hasRecording
            ? "현재 녹음본이 선택되어 있으며, 다음 단계에서 그대로 사용됩니다."
            : "녹음은 선택 항목입니다. 필요하면 건너뛰고 진행할 수 있습니다."}
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={handleSkip}
            disabled={isRecorderStopping}
            className="bg-[#f0f0f0] rounded-[14px] h-[50px] px-5 font-['Noto_Sans_KR'] font-medium text-[14px] text-[#262626] hover:bg-[#e5e5e5] transition-colors disabled:opacity-50"
          >
            건너뛰기
          </button>
          <button
            onClick={onNext}
            disabled={isRecording || isRecorderStopping}
            className="flex-1 bg-black rounded-[14px] h-[50px] font-['Noto_Sans_KR'] font-semibold text-[15px] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-colors"
          >
            {hasRecording ? "이 녹음으로 다음" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}
