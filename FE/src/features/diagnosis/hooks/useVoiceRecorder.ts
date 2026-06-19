import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  buildVoiceWavFile,
  clearStagedVoiceRecording,
  getStagedVoiceRecordingFile,
  getStagedVoiceRecordingMeta,
  stageVoiceRecording,
  type StagedVoiceRecordingMeta,
} from "../lib/voiceRecording";
import { validateAudioUploadFile } from "../../../shared/lib/fileSecurity";

export interface VoiceWaveformBar {
  barHeight: number;
  opacity: number;
}

interface UseVoiceRecorderOptions {
  maxRecordingSeconds?: number;
}

interface UseVoiceRecorderResult {
  maxRecordingSeconds: number;
  isRecording: boolean;
  isPaused: boolean;
  isRecorderStopping: boolean;
  hasRecording: boolean;
  recordingTime: number;
  recordingMeta: StagedVoiceRecordingMeta | null;
  microphonePermission: "unknown" | "prompt" | "granted" | "denied";
  permissionGuide: string;
  statusText: string;
  error: string | null;
  playbackUrl: string | null;
  playbackAudioRef: RefObject<HTMLAudioElement | null>;
  isPlaybackPlaying: boolean;
  playbackCurrentSec: number;
  playbackDurationSec: number;
  progressPercent: number;
  waveformBars: VoiceWaveformBar[];
  recordingTimeLabel: string;
  maxTimeLabel: string;
  playbackCurrentLabel: string;
  playbackDurationLabel: string;
  canProceed: boolean;
  handleRecordToggle: () => Promise<void>;
  handlePauseResume: () => void;
  handleRetryRecording: () => Promise<void>;
  handleDownloadVoice: () => void;
  togglePlayback: () => void;
  seekPlayback: (nextSeconds: number) => void;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function useVoiceRecorder({ maxRecordingSeconds = 90 }: UseVoiceRecorderOptions = {}): UseVoiceRecorderResult {
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
    getStagedVoiceRecordingMeta(),
  );
  const [isPlaybackPlaying, setIsPlaybackPlaying] = useState(false);
  const [playbackCurrentSec, setPlaybackCurrentSec] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

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
        const duration = Number.isFinite(audio.duration) ? audio.duration : Number.NaN;
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

    let voiceFile: File;
    try {
      voiceFile = await buildVoiceWavFile(voiceBlob);
    } catch {
      setHasRecording(false);
      setRecordingMeta(null);
      setError("WAV 변환에 실패했습니다. 다시 녹음해 주세요.");
      clearStagedVoiceRecording();
      return;
    }

    const validationMessage = validateAudioUploadFile(voiceFile);
    if (validationMessage) {
      setHasRecording(false);
      setRecordingMeta(null);
      setError(validationMessage);
      clearStagedVoiceRecording();
      return;
    }

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
      const supportedMimeType = preferredMimeTypes.find((type) => MediaRecorder.isTypeSupported(type));
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
          : "마이크를 사용할 수 없습니다. 브라우저 권한을 확인해 주세요.";
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
      setError("다운로드할 음성 파일이 없습니다. 다시 녹음해 주세요.");
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
      if (nextTime >= maxRecordingSeconds) {
        stopRecording({ save: true });
      }
    }, 90);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRecording, isPaused, maxRecordingSeconds]);

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

  const progressPercent = Math.min(100, (recordingTime / maxRecordingSeconds) * 100);
  const isLiveRecording = isRecording && !isPaused;

  const permissionGuide =
    microphonePermission === "denied"
      ? "권한 거부"
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

  const waveformBars = useMemo(
    () =>
      Array.from({ length: 32 }).map((_, index) => {
        const base = hasRecording ? 8 : 6;
        const drive = isLiveRecording ? Math.max(audioLevel, 0.07) : hasRecording ? 0.15 : 0.04;
        const swing = Math.abs(Math.sin((waveTick + index * 1.7) * 0.45));
        const barHeight = Math.round(base + 38 * (0.25 + drive * swing));
        const opacity = isLiveRecording ? 0.35 + drive * 0.6 : hasRecording ? 0.45 : 0.18;
        return { barHeight: Math.max(8, Math.min(44, barHeight)), opacity };
      }),
    [audioLevel, hasRecording, isLiveRecording, waveTick],
  );

  const playbackDurationSec = recordingMeta?.durationSec ?? 0;

  return {
    maxRecordingSeconds,
    isRecording,
    isPaused,
    isRecorderStopping,
    hasRecording,
    recordingTime,
    recordingMeta,
    microphonePermission,
    permissionGuide,
    statusText,
    error,
    playbackUrl,
    playbackAudioRef,
    isPlaybackPlaying,
    playbackCurrentSec,
    playbackDurationSec,
    progressPercent,
    waveformBars,
    recordingTimeLabel: formatTime(recordingMeta?.durationSec ?? recordingTime),
    maxTimeLabel: formatTime(maxRecordingSeconds),
    playbackCurrentLabel: formatTime(playbackCurrentSec),
    playbackDurationLabel: formatTime(playbackDurationSec),
    canProceed: hasRecording && !isRecording && !isRecorderStopping,
    handleRecordToggle,
    handlePauseResume,
    handleRetryRecording,
    handleDownloadVoice,
    togglePlayback,
    seekPlayback,
  };
}
