export interface StagedVoiceRecordingMeta {
  fileName: string;
  mimeType: string;
  size: number;
  durationSec: number;
  recordedAt: string;
}

const STAGED_VOICE_META_KEY = "stagedDiagnosisVoiceMeta";

let stagedVoiceFile: File | null = null;

function encodeAudioBufferToWavBlob(audioBuffer: AudioBuffer) {
  const channelCount = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const frameCount = audioBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = channelCount * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = frameCount * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  const channelData = Array.from({ length: channelCount }, (_, channelIndex) =>
    audioBuffer.getChannelData(channelIndex)
  );

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    for (let channelIndex = 0; channelIndex < channelCount; channelIndex += 1) {
      const sample = Math.max(-1, Math.min(1, channelData[channelIndex][frameIndex]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += bytesPerSample;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export async function buildVoiceWavFile(blob: Blob) {
  const audioContext = new AudioContext();
  try {
    const buffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(buffer.slice(0));
    const wavBlob = encodeAudioBufferToWavBlob(audioBuffer);
    const now = new Date();
    const fileName = `voice-${now.toISOString().replace(/[:.]/g, "-")}.wav`;
    return new File([wavBlob], fileName, { type: "audio/wav" });
  } finally {
    await audioContext.close();
  }
}

export function stageVoiceRecording(file: File, durationSec: number) {
  stagedVoiceFile = file;
  const meta: StagedVoiceRecordingMeta = {
    fileName: file.name,
    mimeType: file.type || "audio/wav",
    size: file.size,
    durationSec,
    recordedAt: new Date().toISOString(),
  };
  sessionStorage.setItem(STAGED_VOICE_META_KEY, JSON.stringify(meta));
  return meta;
}

export function clearStagedVoiceRecording() {
  stagedVoiceFile = null;
  localStorage.removeItem(STAGED_VOICE_META_KEY);
  sessionStorage.removeItem(STAGED_VOICE_META_KEY);
}

export function getStagedVoiceRecordingFile() {
  return stagedVoiceFile;
}

export function getStagedVoiceRecordingMeta() {
  localStorage.removeItem(STAGED_VOICE_META_KEY);
  const raw = sessionStorage.getItem(STAGED_VOICE_META_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StagedVoiceRecordingMeta;
  } catch {
    return null;
  }
}

export function appendStagedVoiceToFormData(formData: FormData, key = "voice") {
  if (!stagedVoiceFile) return;
  formData.append(key, stagedVoiceFile, stagedVoiceFile.name);
}

