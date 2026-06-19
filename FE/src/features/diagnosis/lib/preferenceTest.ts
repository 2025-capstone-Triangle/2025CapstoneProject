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

export interface BackendLikeAnswerRequest {
  q1_environment: number;
  q2_style: number;
  q3_minimal_maximal: number;
  q4_mood: number;
  q5_contrast_type: number;
  q6_motion: number;
  q7_framing: number;
}

export interface BackendPreferencePayload {
  answer: BackendLikeAnswerRequest;
  q8_tone: number[];
}

const PREFERENCE_TEST_RESULT_KEY = "preferenceTestResult";
const STAGED_DIAGNOSIS_PAYLOAD_KEY = "stagedDiagnosisPayload";

export function savePreferenceTestResult(result: PreferenceTestResult) {
  sessionStorage.setItem(PREFERENCE_TEST_RESULT_KEY, JSON.stringify(result));
}

export function clearPreferenceTestResult() {
  localStorage.removeItem(PREFERENCE_TEST_RESULT_KEY);
  sessionStorage.removeItem(PREFERENCE_TEST_RESULT_KEY);
}

export function getPreferenceTestResult() {
  localStorage.removeItem(PREFERENCE_TEST_RESULT_KEY);
  const raw = sessionStorage.getItem(PREFERENCE_TEST_RESULT_KEY);
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
  sessionStorage.setItem(STAGED_DIAGNOSIS_PAYLOAD_KEY, JSON.stringify(payload));
}

export function clearStagedDiagnosisPreferencePayload() {
  localStorage.removeItem(STAGED_DIAGNOSIS_PAYLOAD_KEY);
  sessionStorage.removeItem(STAGED_DIAGNOSIS_PAYLOAD_KEY);
}

export function getStagedDiagnosisPreferencePayload() {
  localStorage.removeItem(STAGED_DIAGNOSIS_PAYLOAD_KEY);
  const raw = sessionStorage.getItem(STAGED_DIAGNOSIS_PAYLOAD_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DiagnosisPreferencePayload;
  } catch {
    return null;
  }
}

export function buildPreferenceTypeLabel(result: PreferenceTestResult) {
  const selected = result.imageSelections
    .map((item) => item.selectedOptionId)
    .filter(Boolean)
    .join(",");
  const { saturation, brightness, contrast, temperature } = result.toneAdjustment;
  return `image:${selected}|tone:${saturation}-${brightness}-${contrast}-${temperature}`;
}

function parseSelectedOptionValue(optionId?: string) {
  if (!optionId) return 0;
  const parts = optionId.split("-");
  const value = Number(parts[1]);
  return Number.isFinite(value) ? value : 0;
}

function mapQuestion1ToEnvironment(optionId?: string) {
  if (!optionId) return 0;
  if (optionId === "1-1" || optionId === "1-2") return 1;
  if (optionId === "1-3" || optionId === "1-4") return 2;
  return 0;
}

function mapQuestion1ToStyle(optionId?: string) {
  if (!optionId) return 0;
  if (optionId === "1-1" || optionId === "1-3") return 1;
  if (optionId === "1-2" || optionId === "1-4") return 2;
  return 0;
}

export function buildBackendPreferencePayload(result: PreferenceTestResult): BackendPreferencePayload {
  const byQuestion = new Map<number, PreferenceImageSelection>();
  result.imageSelections.forEach((item) => {
    byQuestion.set(item.questionNumber, item);
  });
  const question1Selection = byQuestion.get(1)?.selectedOptionId;

  const answer: BackendLikeAnswerRequest = {
    // q1, q2는 질문 1 선택지(1-1~1-4)를 서로 다른 규칙으로 변환합니다.
    q1_environment: mapQuestion1ToEnvironment(question1Selection),
    q2_style: mapQuestion1ToStyle(question1Selection),
    // 나머지는 질문 번호를 한 칸씩 밀어서 매핑합니다.
    q3_minimal_maximal: parseSelectedOptionValue(byQuestion.get(2)?.selectedOptionId),
    q4_mood: parseSelectedOptionValue(byQuestion.get(3)?.selectedOptionId),
    q5_contrast_type: parseSelectedOptionValue(byQuestion.get(4)?.selectedOptionId),
    q6_motion: parseSelectedOptionValue(byQuestion.get(5)?.selectedOptionId),
    q7_framing: parseSelectedOptionValue(byQuestion.get(6)?.selectedOptionId),
  };

  const q8_tone = [
    result.toneAdjustment.saturation,
    result.toneAdjustment.brightness,
    result.toneAdjustment.contrast,
    result.toneAdjustment.temperature,
  ];

  return { answer, q8_tone };
}
