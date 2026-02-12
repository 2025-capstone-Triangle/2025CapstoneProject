export interface PreferenceImageSelection {
  questionNumber: number;
  selectedOptionId: string;
  selectedImageKey: string;
}

export interface PreferenceToneAdjustment {
  saturation: number;
  brightness: number;
  contrast: number;
  temperature: number;
}

export interface PreferenceTestResult {
  introMessage: string;
  commonQuestion: string;
  imageSelections: PreferenceImageSelection[];
  toneAdjustment: PreferenceToneAdjustment;
  completedAt: string;
}

export interface DiagnosisPreferencePayload {
  schemaVersion: "diagnosis-preference-v1";
  submittedAt: string;
  preferenceTest: {
    introMessage: string;
    commonQuestion: string;
    imageSelections: PreferenceImageSelection[];
    toneAdjustment: PreferenceToneAdjustment;
  };
}

const PREFERENCE_TEST_RESULT_KEY = "preferenceTestResult";
const STAGED_DIAGNOSIS_PAYLOAD_KEY = "stagedDiagnosisPayload";

export function savePreferenceTestResult(result: PreferenceTestResult) {
  localStorage.setItem(PREFERENCE_TEST_RESULT_KEY, JSON.stringify(result));
}

export function getPreferenceTestResult() {
  const raw = localStorage.getItem(PREFERENCE_TEST_RESULT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PreferenceTestResult;
  } catch {
    return null;
  }
}

export function buildDiagnosisPreferencePayload(result: PreferenceTestResult): DiagnosisPreferencePayload {
  return {
    schemaVersion: "diagnosis-preference-v1",
    submittedAt: new Date().toISOString(),
    preferenceTest: {
      introMessage: result.introMessage,
      commonQuestion: result.commonQuestion,
      imageSelections: result.imageSelections,
      toneAdjustment: result.toneAdjustment,
    },
  };
}

export function stageDiagnosisPreferencePayload(payload: DiagnosisPreferencePayload) {
  localStorage.setItem(STAGED_DIAGNOSIS_PAYLOAD_KEY, JSON.stringify(payload));
}

export function getStagedDiagnosisPreferencePayload() {
  const raw = localStorage.getItem(STAGED_DIAGNOSIS_PAYLOAD_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DiagnosisPreferencePayload;
  } catch {
    return null;
  }
}

