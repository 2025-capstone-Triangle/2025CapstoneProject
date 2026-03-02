export interface StagedVoiceRecordingMeta {
  fileName: string;
  mimeType: string;
  size: number;
  durationSec: number;
  recordedAt: string;
}

const STAGED_VOICE_META_KEY = "stagedDiagnosisVoiceMeta";

let stagedVoiceFile: File | null = null;

export function buildVoiceWebFile(blob: Blob) {
  const now = new Date();
  const fileName = `voice-${now.toISOString().replace(/[:.]/g, "-")}.web`;
  const mimeType = blob.type || "audio/webm";
  return new File([blob], fileName, { type: mimeType });
}

export function stageVoiceRecording(file: File, durationSec: number) {
  stagedVoiceFile = file;
  const meta: StagedVoiceRecordingMeta = {
    fileName: file.name,
    mimeType: file.type || "audio/webm",
    size: file.size,
    durationSec,
    recordedAt: new Date().toISOString(),
  };
  localStorage.setItem(STAGED_VOICE_META_KEY, JSON.stringify(meta));
  return meta;
}

export function clearStagedVoiceRecording() {
  stagedVoiceFile = null;
  localStorage.removeItem(STAGED_VOICE_META_KEY);
}

export function getStagedVoiceRecordingFile() {
  return stagedVoiceFile;
}

export function getStagedVoiceRecordingMeta() {
  const raw = localStorage.getItem(STAGED_VOICE_META_KEY);
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

