import { useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { HomePage } from "./features/home/pages/HomePage";
import { DiagnosisStartPage } from "./features/diagnosis/pages/DiagnosisStartPage";
import { ImageInputPage } from "./features/diagnosis/pages/ImageInputPage";
import { VoiceInputPage } from "./features/diagnosis/pages/VoiceInputPage";
import { PreferenceTestPage } from "./features/diagnosis/pages/PreferenceTestPage";
import { ReviewInputsPage } from "./features/diagnosis/pages/ReviewInputsPage";
import { AnalyzingPage } from "./features/diagnosis/pages/AnalyzingPage";
import { DiagnosisResultPage } from "./features/diagnosis/pages/DiagnosisResultPage";
import { SaveResultCompletePage } from "./features/diagnosis/pages/SaveResultCompletePage";
import { PersonaListPage } from "./features/persona/pages/PersonaListPage";
import { PersonaDetailPage } from "./features/persona/pages/PersonaDetailPage";
import { PersonaSavedContentsPage } from "./features/persona/pages/PersonaSavedContentsPage";
import { PersonaContentGalleryPage } from "./features/persona/pages/PersonaContentGalleryPage";
import { ContentExplorePage } from "./features/content/pages/ContentExplorePage";
import { ContentAspectRatioPage } from "./features/content/pages/ContentAspectRatioPage";
import { ContentSelectPersonaPage } from "./features/content/pages/ContentSelectPersonaPage";
import { ContentGeneratingPage } from "./features/content/pages/ContentGeneratingPage";
import { ContentResultPage } from "./features/content/pages/ContentResultPage";
import { SavedTemplatesPage } from "./features/content/pages/SavedTemplatesPage";
import { SettingsPage } from "./features/settings/pages/SettingsPage";
import { HelpPage } from "./features/support/pages/HelpPage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { SignupPage } from "./features/auth/pages/SignupPage";
import { ForgotPasswordPage } from "./features/auth/pages/ForgotPasswordPage";
import { AdminConsolePage } from "./features/admin/pages/AdminConsolePage";
import { diagnosePersona, saveNewPersona, type PersonaResponse } from "./features/persona/lib/personaApi";
import { getPendingPersonaCode } from "./features/persona/lib/personaShareCode";
import {
  buildBackendPreferencePayload,
  clearPreferenceTestResult,
  clearStagedDiagnosisPreferencePayload,
  getPreferenceTestResult,
} from "./features/diagnosis/lib/preferenceTest";
import {
  clearStagedDiagnosisImageFiles,
  getStagedDiagnosisImageFiles,
} from "./features/diagnosis/lib/imageStaging";
import { clearStagedVoiceRecording, getStagedVoiceRecordingFile } from "./features/diagnosis/lib/voiceRecording";
import {
  createDiagnosisSessionId,
  openDiagnosisProgressStream,
  type DiagnosisProgressEventPayload,
} from "./features/diagnosis/lib/progressApi";
import {
  createContent,
  createTrendContent,
  type ContentCreateResponse,
  type ContentType,
} from "./features/content/lib/contentApi";
import { clearAuth, getMemberInfo, getSavedAuth, isAuthenticated, saveAuth, signOut } from "./lib/auth";
import { ErrorToast } from "./shared/ui/ErrorToast";
import { HamburgerMenu } from "./shared/layout/HamburgerMenu";

type Page =
  | "home"
  | "login"
  | "signup"
  | "forgot-password"
  | "diagnosis-start"
  | "image-input"
  | "voice-input"
  | "preference-test"
  | "review-inputs"
  | "analyzing"
  | "diagnosis-result"
  | "save-complete"
  | "persona-list"
  | "persona-detail"
  | "persona-saved-contents"
  | "persona-content-gallery"
  | "content-explore"
  | "content-home"
  | "content-aspect-ratio"
  | "content-select-persona"
  | "content-generating"
  | "content-result"
  | "saved-templates"
  | "settings"
  | "help"
  | "admin";

type DiagnosisProgressState = {
  sessionId: string;
  progress: number;
  message: string;
  step: string;
  queuePosition: number | null;
  connected: boolean;
  status: "idle" | "connecting" | "connected" | "queued" | "running" | "completed" | "error";
};

type ContentProgressState = {
  sessionId: string;
  progress: number;
  message: string;
  step: string;
  queuePosition: number | null;
  connected: boolean;
  status: "idle" | "connecting" | "queued" | "processing" | "running" | "completed" | "error";
};

const DEFAULT_CONTENT_PROGRESS: ContentProgressState = {
  sessionId: "",
  progress: 0,
  message: "콘텐츠를 생성하고 있습니다...",
  step: "idle",
  queuePosition: null,
  connected: false,
  status: "idle",
};

const UNAUTH_ALLOWED_PAGES = new Set<Page>([
  "home",
  "login",
  "signup",
  "forgot-password",
  "diagnosis-start",
  "image-input",
  "voice-input",
  "preference-test",
  "review-inputs",
  "analyzing",
  "diagnosis-result",
]);

const DIAGNOSIS_FLOW_PAGES = new Set<Page>([
  "diagnosis-start",
  "image-input",
  "voice-input",
  "preference-test",
  "review-inputs",
  "analyzing",
  "diagnosis-result",
  "save-complete",
]);

function getLoginGateMessage(page: Page) {
  if (page.startsWith("content") || page === "saved-templates") {
    return "콘텐츠 생성과 저장은 로그인 후 이용할 수 있어요.";
  }
  if (page.startsWith("persona")) {
    return "내 페르소나 기능은 로그인 후 이용할 수 있어요.";
  }
  if (page === "settings" || page === "help") {
    return "이 메뉴는 로그인 후 이용할 수 있어요.";
  }
  return "이 기능은 로그인 후 이용할 수 있어요.";
}

function decodeJwtPayload(token?: string) {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const base64 = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isAdminAuth() {
  const auth = getSavedAuth();
  if (!auth?.accessToken) return false;
  const payload = decodeJwtPayload(auth.accessToken);
  const roleClaim = payload?.roles;
  if (typeof roleClaim === "string" && roleClaim.includes("ROLE_ADMIN")) return true;
  return auth.username === "admin";
}

function getContentTypeByRatio(ratio: string): ContentType {
  if (ratio === "1:1") return "SQUARE";
  if (ratio === "9:16") return "STORY";
  return "FEED";
}

const DIAGNOSIS_RESULT_STORAGE_KEY = "app.diagnosis.latest-result";
const DIAGNOSIS_RESULT_PAGE_STORAGE_KEY = "app.diagnosis.last-page";
const APP_TRANSIENT_STATE_STORAGE_KEY = "app.transient.state";
const TRANSIENT_RESTORE_PAGES = new Set<Page>(["analyzing", "content-generating"]);
const DEFAULT_DIAGNOSIS_PROGRESS: DiagnosisProgressState = {
  sessionId: "",
  progress: 0,
  message: "AI가 페르소나를 분석하고 있습니다...",
  step: "idle",
  queuePosition: null,
  connected: false,
  status: "idle",
};

interface AppTransientState {
  page: Page;
  history: Page[];
  diagnosisProgress?: DiagnosisProgressState;
  selectedRatio?: string;
  selectedPersonaCode?: string;
  selectedTrendReferenceId?: number | null;
  isRegeneratingContent?: boolean;
  autoSelectPersonaForContent?: boolean;
}
interface AppBootstrap {
  page: Page;
  history: Page[];
  diagnosisCode: string;
  diagnosisResult: PersonaResponse | null;
  diagnosisProgress: DiagnosisProgressState;
  selectedRatio: string;
  selectedPersonaCode: string;
  selectedTrendReferenceId: number | null;
  isRegeneratingContent: boolean;
  autoSelectPersonaForContent: boolean;
}

function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeServerProgress(raw: unknown): number | null {
  if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
  if (raw >= 0 && raw <= 1) return clampProgress(raw * 100);
  if (raw >= 1 && raw <= 100) return clampProgress(raw);
  if (raw > 100 && raw <= 10000) return clampProgress(raw / 100);
  return null;
}

function normalizeQueuePosition(raw: unknown): number | null {
  const numeric =
    typeof raw === "number"
      ? raw
      : typeof raw === "string" && raw.trim().length > 0
        ? Number(raw)
        : NaN;
  if (!Number.isFinite(numeric)) return null;
  return Math.max(1, Math.round(numeric));
}

function inferMessage(payload: DiagnosisProgressEventPayload | null, fallback: string) {
  if (payload?.message && payload.message.trim().length > 0) {
    const message = payload.message.trim();
    const lower = message.toLowerCase();
    if (
      lower === "connect" ||
      lower === "connected" ||
      lower === "started" ||
      lower === "queued" ||
      lower.includes("吏꾪뻾?곹솴 梨꾨꼸") ||
      lower.includes("梨꾨꼸 ?곌껐")
    ) {
      return fallback;
    }
    return message;
  }
  return fallback;
}

function getStoredDiagnosisResult() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(DIAGNOSIS_RESULT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersonaResponse;
  } catch {
    return null;
  }
}

function isHistoryArray(value: unknown): value is Page[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function getStoredTransientState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(APP_TRANSIENT_STATE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppTransientState;
  } catch {
    return null;
  }
}

function getInitialAppBootstrap(): AppBootstrap {
  const storedDiagnosisResult = getStoredDiagnosisResult();
  const storedTransientState = getStoredTransientState();
  const storedPage =
    typeof window !== "undefined"
      ? window.sessionStorage.getItem(DIAGNOSIS_RESULT_PAGE_STORAGE_KEY)
      : null;
  const canRestoreDiagnosisResultPage =
    storedPage === "diagnosis-result" && Boolean(storedDiagnosisResult?.code);

  if (canRestoreDiagnosisResultPage) {
    return {
      page: "diagnosis-result" as Page,
      history: ["diagnosis-result"] as Page[],
      diagnosisCode: storedDiagnosisResult?.code ?? "",
      diagnosisResult: storedDiagnosisResult,
      diagnosisProgress: DEFAULT_DIAGNOSIS_PROGRESS,
      selectedRatio: "4:5",
      selectedPersonaCode: "",
      selectedTrendReferenceId: null,
      isRegeneratingContent: false,
      autoSelectPersonaForContent: false,
    };
  }

  if (
    storedTransientState &&
    TRANSIENT_RESTORE_PAGES.has(storedTransientState.page) &&
    isHistoryArray(storedTransientState.history)
  ) {
    return {
      page: storedTransientState.page,
      history: storedTransientState.history.length ? storedTransientState.history : [storedTransientState.page],
      diagnosisCode: "",
      diagnosisResult: null,
      diagnosisProgress: storedTransientState.diagnosisProgress ?? DEFAULT_DIAGNOSIS_PROGRESS,
      selectedRatio: storedTransientState.selectedRatio ?? "4:5",
      selectedPersonaCode: storedTransientState.selectedPersonaCode ?? "",
      selectedTrendReferenceId: storedTransientState.selectedTrendReferenceId ?? null,
      isRegeneratingContent: Boolean(storedTransientState.isRegeneratingContent),
      autoSelectPersonaForContent: Boolean(storedTransientState.autoSelectPersonaForContent),
    };
  }

  const defaultPage = isAuthenticated() && isAdminAuth() ? "admin" : "home";
  return {
    page: defaultPage as Page,
    history: [defaultPage as Page],
    diagnosisCode: "",
    diagnosisResult: null as PersonaResponse | null,
    diagnosisProgress: DEFAULT_DIAGNOSIS_PROGRESS,
    selectedRatio: "4:5",
    selectedPersonaCode: "",
    selectedTrendReferenceId: null,
    isRegeneratingContent: false,
    autoSelectPersonaForContent: false,
  };
}

export default function App() {
  const [bootstrap] = useState(() => getInitialAppBootstrap());
  const [currentPage, setCurrentPage] = useState<Page>(bootstrap.page);
  const [activeTab, setActiveTab] = useState<"home" | "persona" | "content">("home");
  const [pageHistory, setPageHistory] = useState<Page[]>(bootstrap.history);
  const [selectedRatio, setSelectedRatio] = useState<string>(bootstrap.selectedRatio);
  const [isRegeneratingContent, setIsRegeneratingContent] = useState<boolean>(bootstrap.isRegeneratingContent);
  const [autoSelectPersonaForContent, setAutoSelectPersonaForContent] = useState<boolean>(bootstrap.autoSelectPersonaForContent);
  const [contentGenerationError, setContentGenerationError] = useState<string>("");
  const [latestGeneratedContent, setLatestGeneratedContent] = useState<ContentCreateResponse | null>(null);
  const [contentProgress, setContentProgress] = useState<ContentProgressState>(DEFAULT_CONTENT_PROGRESS);
  const [selectedTrendReferenceId, setSelectedTrendReferenceId] = useState<number | null>(bootstrap.selectedTrendReferenceId);
  const [loginGateMessage, setLoginGateMessage] = useState<string | null>(null);
  const [selectedPersonaCode, setSelectedPersonaCode] = useState<string>(bootstrap.selectedPersonaCode);
  const [latestDiagnosisCode, setLatestDiagnosisCode] = useState<string>(bootstrap.diagnosisCode);
  const [latestDiagnosisResult, setLatestDiagnosisResult] = useState<PersonaResponse | null>(bootstrap.diagnosisResult);
  const [diagnosisProgress, setDiagnosisProgress] = useState<DiagnosisProgressState>(bootstrap.diagnosisProgress);
  const [diagnosisReconnectTick, setDiagnosisReconnectTick] = useState(0);
  const [contentReconnectTick, setContentReconnectTick] = useState(0);
  const [isGlobalMenuOpen, setIsGlobalMenuOpen] = useState(false);
  const [showLeaveDiagnosisWarning, setShowLeaveDiagnosisWarning] = useState(false);
  const previousPageRef = useRef<Page>(currentPage);
  const currentPageRef = useRef<Page>(currentPage);
  const diagnosisRunActiveRef = useRef(false);
  const contentGenerationRunActiveRef = useRef(false);
  const contentStreamCloseRef = useRef<(() => void) | null>(null);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);
  const isAdminPage = currentPage === "admin";

  const loggedIn = isAuthenticated();

  useEffect(() => {
    if (isAdminPage) {
      setIsGlobalMenuOpen(false);
    }
  }, [isAdminPage]);

  useEffect(() => {
    if (currentPage !== "analyzing") {
      setShowLeaveDiagnosisWarning(false);
    }
  }, [currentPage]);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    const triggerDiagnosisReconnect = () => {
      if (currentPageRef.current !== "analyzing") return;
      diagnosisRunActiveRef.current = false;
      setDiagnosisReconnectTick((prev) => prev + 1);
    };

    const triggerContentReconnect = () => {
      if (currentPageRef.current !== "content-generating") return;
      contentStreamCloseRef.current?.();
      contentStreamCloseRef.current = null;
      contentGenerationRunActiveRef.current = false;
      setContentReconnectTick((prev) => prev + 1);
    };

    const handleResume = () => {
      triggerDiagnosisReconnect();
      triggerContentReconnect();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleResume();
      }
    };

    window.addEventListener("pageshow", handleResume);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", handleResume);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Wake Lock: 진단/콘텐츠 생성 중 화면 꺼짐 방지
  useEffect(() => {
    const ACTIVE_DIAGNOSIS = new Set(["connecting", "connected", "queued", "running"]);
    const ACTIVE_CONTENT = new Set(["connecting", "queued", "processing", "running"]);
    const isActive = ACTIVE_DIAGNOSIS.has(diagnosisProgress.status) || ACTIVE_CONTENT.has(contentProgress.status);

    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> };
    };

    if (!isActive) {
      if (wakeLockRef.current) {
        void wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
      return;
    }

    if (wakeLockRef.current || !nav.wakeLock || document.visibilityState !== "visible") return;

    void nav.wakeLock.request("screen")
      .then((lock) => { wakeLockRef.current = lock; })
      .catch(() => {});
  }, [diagnosisProgress.status, contentProgress.status]);

  // 콘텐츠 생성 SSE 재연결 (다른 앱 복귀 시)
  useEffect(() => {
    if (currentPage !== "content-generating") return;
    const { sessionId } = contentProgress;
    if (!sessionId) return;
    if (contentProgress.status === "completed" || contentProgress.status === "error") return;
    if (contentGenerationRunActiveRef.current) return;

    const closeStream = openDiagnosisProgressStream({
      sessionId,
      onEvent: (event) => {
        const payload = event.data;
        const eventName = event.event.toLowerCase();
        const step = String(payload?.step ?? event.event ?? "running");
        const isCompleted = step.toLowerCase().includes("complete");
        const isError = step.toLowerCase().includes("error");
        const serverProgress =
          typeof payload?.progress === "number" && Number.isFinite(payload.progress)
            ? Math.max(0, Math.min(100, Math.round(payload.progress)))
            : null;

        setContentProgress((prev) => {
          if (prev.sessionId !== sessionId) return prev;
          let nextProgress = serverProgress !== null ? serverProgress : prev.progress;
          if (eventName === "queued") nextProgress = Math.max(nextProgress, 18);
          else if (eventName === "processing") nextProgress = Math.max(nextProgress, 42);
          if (isCompleted) nextProgress = 100;

          let message = prev.message;
          let queuePosition = prev.queuePosition;
          if (eventName === "queued") {
            const position = Number(payload?.position ?? payload?.queuePosition ?? payload?.rank);
            queuePosition = Number.isFinite(position) && position > 0 ? Math.round(position) : null;
            message = queuePosition
              ? `현재 대기열 ${queuePosition}번입니다. 순서가 되면 자동으로 시작됩니다.`
              : "콘텐츠 생성 요청이 대기열에 등록되었습니다...";
          } else if (eventName === "processing") {
            queuePosition = null;
            message = "콘텐츠 생성을 시작했습니다...";
          } else if (payload?.message && String(payload.message).trim()) {
            queuePosition = null;
            message = String(payload.message).trim();
          }

          return {
            ...prev,
            progress: Math.max(prev.progress, nextProgress),
            message,
            step,
            queuePosition,
            connected: true,
            status: isError
              ? "error"
              : isCompleted
                ? "completed"
                : eventName === "queued"
                  ? "queued"
                  : eventName === "processing"
                    ? "processing"
                    : "running",
          };
        });
      },
      onError: () => {
        setContentProgress((prev) =>
          prev.sessionId === sessionId
            ? { ...prev, connected: false, status: prev.status === "completed" ? "completed" : "error" }
            : prev
        );
      },
    });
    contentStreamCloseRef.current = closeStream;

    return () => {
      closeStream();
      if (contentStreamCloseRef.current === closeStream) contentStreamCloseRef.current = null;
    };
  }, [currentPage, contentProgress.sessionId, contentProgress.status, contentReconnectTick]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (latestDiagnosisResult) {
      window.sessionStorage.setItem(
        DIAGNOSIS_RESULT_STORAGE_KEY,
        JSON.stringify(latestDiagnosisResult)
      );
    } else {
      window.sessionStorage.removeItem(DIAGNOSIS_RESULT_STORAGE_KEY);
    }
  }, [latestDiagnosisResult]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (currentPage === "diagnosis-result" && latestDiagnosisResult) {
      window.sessionStorage.setItem(DIAGNOSIS_RESULT_PAGE_STORAGE_KEY, "diagnosis-result");
      return;
    }

    window.sessionStorage.removeItem(DIAGNOSIS_RESULT_PAGE_STORAGE_KEY);
  }, [currentPage, latestDiagnosisResult]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (currentPage === "analyzing" || currentPage === "content-generating") {
      const transientState: AppTransientState = {
        page: currentPage,
        history: pageHistory,
        diagnosisProgress,
        selectedRatio,
        selectedPersonaCode,
        selectedTrendReferenceId,
        isRegeneratingContent,
        autoSelectPersonaForContent,
      };
      window.sessionStorage.setItem(APP_TRANSIENT_STATE_STORAGE_KEY, JSON.stringify(transientState));
      return;
    }

    window.sessionStorage.removeItem(APP_TRANSIENT_STATE_STORAGE_KEY);
  }, [
    currentPage,
    pageHistory,
    diagnosisProgress,
    selectedRatio,
    selectedPersonaCode,
    selectedTrendReferenceId,
    isRegeneratingContent,
    autoSelectPersonaForContent,
  ]);

  useEffect(() => {
    const handleOpenMenu = () => setIsGlobalMenuOpen(true);
    const handleTopbarHomeClickEvent = () => {
      if (
        currentPage === "analyzing" &&
        diagnosisProgress.status !== "completed" &&
        diagnosisProgress.status !== "error"
      ) {
        setShowLeaveDiagnosisWarning(true);
        return;
      }
      handleNavigateToHome();
    };

    window.addEventListener("app:menu:open", handleOpenMenu);
    window.addEventListener("app:topbar-home-click", handleTopbarHomeClickEvent);
    return () => {
      window.removeEventListener("app:menu:open", handleOpenMenu);
      window.removeEventListener("app:topbar-home-click", handleTopbarHomeClickEvent);
    };
  }, [currentPage, diagnosisProgress.status]);

  useEffect(() => {
    if (currentPage !== "analyzing") return;
    if (!diagnosisProgress.sessionId) return;
    if (diagnosisProgress.status === "completed" || diagnosisProgress.status === "error") return;
    if (diagnosisRunActiveRef.current) return;

    const closeProgressStream = openDiagnosisProgressStream({
      sessionId: diagnosisProgress.sessionId,
      onEvent: (event) => {
        const payload = event.data;
        const eventName = event.event.toLowerCase();
        const rawStep = String(payload?.step ?? "").toLowerCase();
        const rawMessage = String(payload?.message ?? "").toLowerCase();
        const rawData = event.rawData.trim().toLowerCase();
        const isConnectEvent =
          eventName === "connect" ||
          rawStep === "connect" ||
          rawMessage === "connect" ||
          rawData === "connect";
        const isQueuedEvent =
          eventName === "queued" || rawStep === "queued" || rawMessage === "queued";

        if (isConnectEvent) {
          setDiagnosisProgress((prev) => ({
            ...prev,
            connected: true,
            status: prev.status === "queued" ? "queued" : "connected",
          }));
          return;
        }

        if (isQueuedEvent) {
          const queuePosition = normalizeQueuePosition(
            payload?.position ?? payload?.queuePosition ?? payload?.rank,
          );
          const queueMessage = payload?.message?.trim()
            ? payload.message.trim()
            : queuePosition
              ? `현재 대기열 ${queuePosition}번입니다. 순서가 되면 자동으로 분석이 시작됩니다.`
              : "진단 요청이 접수되어 대기열에 등록되었습니다.";
          setDiagnosisProgress((prev) => ({
            ...prev,
            message: queueMessage,
            step: "queued",
            queuePosition,
            connected: true,
            status: "queued",
          }));
          return;
        }

        const step = String(payload?.step ?? event.event ?? "running");
        const normalizedProgress = normalizeServerProgress(payload?.progress);
        const completed = step.toLowerCase().includes("complete");
        setDiagnosisProgress((prev) => ({
          ...prev,
          progress:
            normalizedProgress !== null
              ? clampProgress(normalizedProgress)
              : completed
                ? 100
                : prev.progress,
          message: inferMessage(payload, prev.message || "진행상황을 반영하고 있습니다..."),
          step,
          queuePosition: null,
          connected: true,
          status: completed ? "completed" : "running",
        }));
      },
      onError: (error) => {
        setDiagnosisProgress((prev) => ({
          ...prev,
          status: "error",
          message: error.message || "진단 진행 연결이 불안정합니다. 잠시 후 다시 시도해 주세요.",
          step: "stream-error",
          connected: false,
        }));
      },
    });

    return closeProgressStream;
  }, [currentPage, diagnosisProgress.sessionId, diagnosisProgress.status, diagnosisReconnectTick]);

  useEffect(() => {
    if (currentPage !== "content-generating") return;
    if (contentGenerationRunActiveRef.current) return;
    if (latestGeneratedContent || contentGenerationError) return;
    if (!selectedPersonaCode) return;

    void runContentGeneration(selectedRatio, selectedPersonaCode);
  }, [
    currentPage,
    latestGeneratedContent,
    contentGenerationError,
    selectedPersonaCode,
    selectedRatio,
  ]);

  const canAccessPage = (page: Page) => {
    if (loggedIn) return true;
    return UNAUTH_ALLOWED_PAGES.has(page);
  };

  const requestLoginForPage = (page: Page) => {
    setLoginGateMessage(getLoginGateMessage(page));
  };

  const handleNavigate = (page: Page, options?: { autoSelectPersonaForContent?: boolean }) => {
    if (!canAccessPage(page)) {
      requestLoginForPage(page);
      return;
    }

    if (page === "content-aspect-ratio") {
      setAutoSelectPersonaForContent(Boolean(options?.autoSelectPersonaForContent));
      const keepTrendReference =
        (currentPage === "content-select-persona" || currentPage === "content-result") &&
        selectedTrendReferenceId !== null;
      if (!keepTrendReference) {
        setSelectedTrendReferenceId(null);
      }
    }

    setPageHistory((prev) => [...prev, page]);
    setCurrentPage(page);
  };

  const handleNavigateWithoutHistory = (page: Page) => {
    if (!canAccessPage(page)) {
      requestLoginForPage(page);
      return;
    }

    setCurrentPage(page);
  };

  const handleStartTrendingContentFlow = (referenceId: number) => {
    setSelectedTrendReferenceId(referenceId);
    setIsRegeneratingContent(false);
    setAutoSelectPersonaForContent(false);
    setContentGenerationError("");
    handleNavigate("content-select-persona");
  };

  const isDiagnosisLoading =
    currentPage === "analyzing" &&
    diagnosisProgress.status !== "completed" &&
    diagnosisProgress.status !== "error";

  const handleNavigateToHome = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(APP_TRANSIENT_STATE_STORAGE_KEY);
    }
    setIsGlobalMenuOpen(false);
    setShowLeaveDiagnosisWarning(false);
    setPageHistory(["home"]);
    setCurrentPage("home");
    setActiveTab("home");
    setDiagnosisProgress(DEFAULT_DIAGNOSIS_PROGRESS);
    setAutoSelectPersonaForContent(false);
    setSelectedTrendReferenceId(null);
  };

  const handleTopbarHomeClick = () => {
    if (isDiagnosisLoading) {
      setShowLeaveDiagnosisWarning(true);
      return;
    }
    handleNavigateToHome();
  };

  useEffect(() => {
    const previousPage = previousPageRef.current;
    const leftDiagnosisFlow =
      DIAGNOSIS_FLOW_PAGES.has(previousPage) && !DIAGNOSIS_FLOW_PAGES.has(currentPage);

    if (leftDiagnosisFlow) {
      clearStagedDiagnosisImageFiles();
      clearStagedVoiceRecording();
      clearPreferenceTestResult();
      clearStagedDiagnosisPreferencePayload();
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(APP_TRANSIENT_STATE_STORAGE_KEY);
      }
      setLatestDiagnosisCode("");
      setLatestDiagnosisResult(null);
      setDiagnosisProgress(DEFAULT_DIAGNOSIS_PROGRESS);
    }

    previousPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    if (canAccessPage(currentPage)) return;

    setPageHistory(["home"]);
    setCurrentPage("home");
    setActiveTab("home");
  }, [currentPage, loggedIn]);

  useEffect(() => {
    if (currentPage === "login" || currentPage === "signup") {
      setLoginGateMessage(null);
    }
  }, [currentPage]);

  useEffect(() => {
    const handleAuthExpired = () => {
      clearAuth();
      setLoginGateMessage("로그인이 만료되었습니다. 다시 로그인해 주세요.");
      setPageHistory(["home"]);
      setCurrentPage("login");
      setActiveTab("home");
      setLatestDiagnosisCode("");
      setLatestDiagnosisResult(null);
      setDiagnosisProgress(DEFAULT_DIAGNOSIS_PROGRESS);
    };
    window.addEventListener("auth:expired", handleAuthExpired);
    return () => window.removeEventListener("auth:expired", handleAuthExpired);
  }, []);

  useEffect(() => {
    if (loggedIn) {
      setLoginGateMessage(null);
      if (currentPage === "login") {
        if (isAdminAuth()) {
          setPageHistory(["admin"]);
          setCurrentPage("admin");
        } else {
          setPageHistory(["home"]);
          setCurrentPage("home");
          setActiveTab("home");
        }
      }
    }
  }, [loggedIn, currentPage]);

  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const member = await getMemberInfo();
        if (!cancelled) {
          const auth = getSavedAuth();
          if (!auth?.accessToken) return;
          saveAuth(
            {
              accessToken: auth.accessToken,
              grantType: auth.grantType ?? "Bearer",
              expiresIn: auth.expiresIn ?? 0,
            },
            { username: member.username, email: member.email }
          );
        }
      } catch (error) {
        if (!cancelled) {
          // `/api/v1/member` is occasionally unstable on server side.
          // Keep current auth state unless backend explicitly returns 401/403
          // (handled globally in apiRequest via auth:expired event).
          console.warn("[member.info] failed to refresh profile", error);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  const handleBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop();
      const previousPage = newHistory[newHistory.length - 1];
      setPageHistory(newHistory);
      setCurrentPage(previousPage);
      return;
    }

    handleNavigateToHome();
  };

  const handleBackSkipLoading = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop();

      let previousPage = newHistory[newHistory.length - 1];
      if (previousPage === "analyzing" || previousPage === "content-generating") {
        newHistory.pop();
        previousPage = newHistory[newHistory.length - 1] || "home";
      }

      setPageHistory(newHistory);
      setCurrentPage(previousPage);
      return;
    }

    handleNavigateToHome();
  };

  const handleTabChange = (tab: "home" | "persona" | "content") => {
    setActiveTab(tab);
    if (tab === "home") {
      handleNavigate("home");
    } else if (tab === "persona") {
      handleNavigate("persona-list");
    } else {
      handleNavigate("content-aspect-ratio", { autoSelectPersonaForContent: false });
    }
  };

  const handleGlobalMenuNavigate = (page: string) => {
    const targetPage = page as Page;
    if (page === "home") {
      setActiveTab("home");
    } else if (page.startsWith("persona")) {
      setActiveTab("persona");
    } else if (page.startsWith("content") || page === "saved-templates") {
      setActiveTab("content");
    }
    handleNavigate(targetPage);
  };

  const handleSignupComplete = () => {
    setLoginGateMessage(null);
    if (getPendingPersonaCode()) {
      handleNavigate("persona-list");
      return;
    }
    setPageHistory(["home"]);
    setCurrentPage("home");
    setActiveTab("home");
  };

  const handleLoginComplete = () => {
    setLoginGateMessage(null);
    if (getPendingPersonaCode()) {
      handleNavigate("persona-list");
      return;
    }
    if (isAdminAuth()) {
      setPageHistory(["admin"]);
      setCurrentPage("admin");
      return;
    }
    setPageHistory(["home"]);
    setCurrentPage("home");
    setActiveTab("home");
  };

  const handleDiagnosisSave = async ({ code, name }: { code: string; name: string }) => {
    const targetCode = latestDiagnosisCode || code;
    await saveNewPersona(targetCode, name);
    setSelectedPersonaCode(targetCode);

    handleNavigate("save-complete");
  };

  const runPersonaDiagnosis = async () => {
    diagnosisRunActiveRef.current = true;
    setLatestDiagnosisResult(null);
    setLatestDiagnosisCode("");
    let closeProgressStream: (() => void) | null = null;
    let connectTimeout: number | null = null;

    try {
      const images = getStagedDiagnosisImageFiles();
      const voice = getStagedVoiceRecordingFile();
      const preference = getPreferenceTestResult();
      if (!preference || !images.length || !voice) {
        setDiagnosisProgress({
          ...DEFAULT_DIAGNOSIS_PROGRESS,
          status: "error",
          message: "입력 데이터가 올바르지 않습니다. 이미지/음성/선호도 테스트를 확인해 주세요.",
          step: "invalid-input",
        });
        return false;
      }

      const sessionId = createDiagnosisSessionId();
      let currentProgress = 0;
      let connectAcked = false;
      let completedFromStream = false;
      let resolveConnect: (() => void) | null = null;
      let rejectConnect: ((reason?: unknown) => void) | null = null;

      const connectPromise = new Promise<void>((resolve, reject) => {
        resolveConnect = resolve;
        rejectConnect = reject;
      });

      // Vercel ?꾨줉?쒓? SSE瑜?踰꾪띁留곹빐 connect ?대깽?멸? ??쾶 ?꾩갑?????덉쓬.
      // 3珥??꾩뿉??誘몄닔?????쇰떒 POST 吏꾪뻾 (SSE ?ㅽ듃由쇱? 怨꾩냽 ?댁뼱??.
      connectTimeout = window.setTimeout(() => {
        if (!connectAcked) {
          connectAcked = true;
          resolveConnect?.();
        }
      }, 3000);

      setDiagnosisProgress({
        sessionId,
        progress: currentProgress,
        message: "대기열을 확인하고 있습니다...",
        step: "queued",
        queuePosition: null,
        connected: false,
        status: "queued",
      });

      closeProgressStream = openDiagnosisProgressStream({
        sessionId,
        onEvent: (event) => {
          if (currentPageRef.current !== "analyzing") return;
          const payload = event.data;
          const eventName = event.event.toLowerCase();
          const rawStep = String(payload?.step ?? "").toLowerCase();
          const rawMessage = String(payload?.message ?? "").toLowerCase();
          const rawData = event.rawData.trim().toLowerCase();
          const isConnectEvent =
            eventName === "connect" ||
            rawStep === "connect" ||
            rawMessage === "connect" ||
            rawData === "connect";
          const isQueuedEvent =
            eventName === "queued" || rawStep === "queued" || rawMessage === "queued";
          const isProcessingStartEvent =
            eventName === "processing" &&
            (rawStep === "started" ||
              rawMessage === "started" ||
              rawData === "started" ||
              rawStep === "processing" ||
              rawMessage === "processing");

          if (!connectAcked && (isConnectEvent || isQueuedEvent || eventName === "processing")) {
            connectAcked = true;
            resolveConnect?.();
          }

          if (isConnectEvent) {
            setDiagnosisProgress((prev) => ({
              sessionId,
              progress: currentProgress,
              message: prev.message || "AI가 페르소나를 분석하고 있습니다...",
              step: String(payload?.step ?? "connect"),
              queuePosition: prev.queuePosition,
              connected: true,
              status: prev.status === "queued" ? "queued" : "connected",
            }));
            return;
          }

          if (!connectAcked) return;

          if (isQueuedEvent) {
            const queuePosition = normalizeQueuePosition(
              payload?.position ?? payload?.queuePosition ?? payload?.rank
            );
            const queueMessage = payload?.message?.trim()
              ? payload.message.trim()
              : queuePosition
                ? `현재 대기열 ${queuePosition}번입니다. 순서가 되면 자동으로 분석이 시작됩니다.`
                : "진단 요청이 접수되어 대기열에 등록되었습니다.";

            setDiagnosisProgress({
              sessionId,
              progress: currentProgress,
              message: queueMessage,
              step: "queued",
              queuePosition,
              connected: true,
              status: "queued",
            });
            return;
          }

          if (isProcessingStartEvent) {
            const processingStartProgress = normalizeServerProgress(payload?.progress);
            currentProgress = processingStartProgress !== null ? clampProgress(processingStartProgress) : 0;
            setDiagnosisProgress((prev) => ({
              sessionId,
              progress: currentProgress,
              message: inferMessage(payload, "AI가 분석을 시작했습니다..."),
              step: "processing",
              queuePosition: null,
              connected: true,
              status: "running",
            }));
            return;
          }

          const step = String(payload?.step ?? event.event ?? "running");
          const normalizedProgress = normalizeServerProgress(payload?.progress);
          currentProgress =
            normalizedProgress !== null
              ? clampProgress(normalizedProgress)
              : currentProgress;

          if (step.toLowerCase().includes("complete")) {
            currentProgress = 100;
            completedFromStream = true;
          }

          setDiagnosisProgress((prev) => ({
            sessionId,
            progress: currentProgress,
            message: inferMessage(payload, prev.status === "queued" ? "AI가 분석을 진행하고 있습니다..." : prev.message || "진행상황을 반영하고 있습니다..."),
            step,
            queuePosition: null,
            connected: true,
            status: completedFromStream ? "completed" : "running",
          }));
        },
        onError: (error) => {
          if (currentPageRef.current !== "analyzing") return;
          if (!connectAcked) {
            rejectConnect?.(error);
            return;
          }

          setDiagnosisProgress((prev) => ({
            ...prev,
            status: "error",
            message: error.message || "진단 진행 연결이 불안정합니다. 잠시 후 다시 시도해 주세요.",
            step: "stream-error",
            connected: false,
          }));
        },
      });

      try {
        await connectPromise;
      } finally {
        if (connectTimeout !== null) {
          window.clearTimeout(connectTimeout);
          connectTimeout = null;
        }
      }

      const { answer, q8_tone } = buildBackendPreferencePayload(preference);
      const profileImage = images[0];
      const result = await diagnosePersona({
        profile: profileImage,
        image: profileImage,
        voice,
        answer,
        q8_tone,
        sessionId,
        callbackUrl: sessionId,
      });

      if (currentPageRef.current !== "analyzing") {
        return false;
      }

      if (result?.code) {
        setLatestDiagnosisResult(result);
        setLatestDiagnosisCode(result.code);
        setDiagnosisProgress((prev) => ({
          ...prev,
          progress: 100,
          status: "completed",
          message: "페르소나 진단이 완료되었습니다.",
          step: "completed",
          queuePosition: null,
          connected: prev.connected,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("[persona.diagnosis]", error);
      if (currentPageRef.current !== "analyzing") {
        return false;
      }
      setLatestDiagnosisCode("");
      setLatestDiagnosisResult(null);
      setDiagnosisProgress((prev) => ({
        ...prev,
        status: "error",
        message: error instanceof Error ? error.message : "진단 요청에 실패했습니다.",
        step: "error",
      }));
      return false;
    } finally {
      diagnosisRunActiveRef.current = false;
      if (connectTimeout !== null) {
        window.clearTimeout(connectTimeout);
      }
      closeProgressStream?.();
    }
  };

  const runContentGeneration = async (ratio: string, personaCode: string) => {
    if (!personaCode) {
      setContentGenerationError("콘텐츠 생성에 페르소나를 먼저 선택해 주세요.");
      return;
    }

    setContentGenerationError("");
    setLatestGeneratedContent(null);
    contentGenerationRunActiveRef.current = true;

    const sessionId = createDiagnosisSessionId();
    let closeContentProgressStream: (() => void) | null = null;

    setContentProgress({
      ...DEFAULT_CONTENT_PROGRESS,
      sessionId,
      status: "connecting",
    });

    closeContentProgressStream = openDiagnosisProgressStream({
      sessionId,
      onOpen: () => {
        // 페이지 복귀 후 wake lock 재획득
        const nav = navigator as Navigator & {
          wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> };
        };
        if (nav.wakeLock && !wakeLockRef.current && document.visibilityState === "visible") {
          void nav.wakeLock.request("screen").then((lock) => { wakeLockRef.current = lock; }).catch(() => {});
        }
      },
      onEvent: (event) => {
        const payload = event.data;
        const eventName = event.event.toLowerCase();
        const step = String(payload?.step ?? event.event ?? "running");
        const lowerStep = step.toLowerCase();
        const isCompleted = lowerStep.includes("complete");
        const isError = lowerStep.includes("error");
        const rawProgress = payload?.progress;
        const serverProgress =
          typeof rawProgress === "number" && Number.isFinite(rawProgress)
            ? Math.max(0, Math.min(100, Math.round(rawProgress)))
            : null;

        setContentProgress((prev) => {
          if (prev.sessionId !== sessionId) return prev;
          let nextProgress = serverProgress !== null ? serverProgress : prev.progress;
          if (eventName === "queued") nextProgress = Math.max(nextProgress, 18);
          else if (eventName === "processing") nextProgress = Math.max(nextProgress, 42);
          if (isCompleted) nextProgress = 100;

          let message = prev.message;
          let queuePosition = prev.queuePosition;
          if (eventName === "queued") {
            const position = Number(payload?.position ?? payload?.queuePosition ?? payload?.rank);
            queuePosition = Number.isFinite(position) && position > 0 ? Math.round(position) : null;
            message = queuePosition
              ? `현재 대기열 ${queuePosition}번입니다. 순서가 되면 자동으로 시작됩니다.`
              : "콘텐츠 생성 요청이 대기열에 등록되었습니다...";
          } else if (eventName === "processing") {
            queuePosition = null;
            message = "콘텐츠 생성을 시작했습니다...";
          } else if (payload?.message && String(payload.message).trim()) {
            queuePosition = null;
            message = String(payload.message).trim();
          }

          return {
            ...prev,
            progress: Math.max(prev.progress, nextProgress),
            message,
            step,
            queuePosition,
            connected: true,
            status: isError
              ? "error"
              : isCompleted
                ? "completed"
                : eventName === "queued"
                  ? "queued"
                  : eventName === "processing"
                    ? "processing"
                    : "running",
          };
        });
      },
      onError: () => {
        setContentProgress((prev) =>
          prev.sessionId === sessionId
            ? { ...prev, connected: false, status: prev.status === "completed" ? "completed" : "error" }
            : prev
        );
      },
    });

    try {
      const result = await createContent({
        code: personaCode,
        type: getContentTypeByRatio(ratio),
        sessionId,
        ...(selectedTrendReferenceId !== null && { referenceId: selectedTrendReferenceId }),
      });
      if (currentPageRef.current !== "content-generating") {
        return;
      }
      setLatestGeneratedContent(result);
      setContentProgress((prev) =>
        prev.sessionId === sessionId
          ? { ...prev, progress: 100, step: "completed", status: "completed" }
          : prev
      );
      handleNavigate("content-result");
    } catch (error) {
      if (currentPageRef.current !== "content-generating") {
        return;
      }
      const message = error instanceof Error ? error.message : "콘텐츠 생성에 실패했습니다.";
      setContentGenerationError(message);
      setContentProgress((prev) =>
        prev.sessionId === sessionId ? { ...prev, status: "error" } : prev
      );
    } finally {
      contentGenerationRunActiveRef.current = false;
      closeContentProgressStream?.();
      if (contentStreamCloseRef.current === closeContentProgressStream) {
        contentStreamCloseRef.current = null;
      }
    }
  };

  return (
    <div className={isAdminPage ? "min-h-screen" : "app-shell"}>
      <ErrorToast />
      <div className={isAdminPage ? "" : "app-shell-stage"}>
      {currentPage === "login" && (
        <LoginPage
          onLogin={handleLoginComplete}
          onNavigate={handleNavigate}
          onBack={handleBack}
        />
      )}

      {currentPage === "admin" && (
        <AdminConsolePage
          adminId="admin"
          onBackHome={handleNavigateToHome}
          onLogout={async () => {
            try {
              await signOut();
            } catch {
              // ignore signout API failures and clear client auth.
            }
            clearAuth();
            setPageHistory(["home"]);
            setCurrentPage("login");
          }}
        />
      )}

      {currentPage === "signup" && (
        <SignupPage onBack={handleBack} onSignup={handleSignupComplete} onNavigate={handleNavigate} />
      )}

      {currentPage === "forgot-password" && (
        <ForgotPasswordPage onBack={handleBack} onNavigate={handleNavigate} />
      )}

      {currentPage === "home" && (
        <HomePage
          onNavigate={handleNavigate}
          onSelectTrendingReference={handleStartTrendingContentFlow}
        />
      )}

      {currentPage === "diagnosis-start" && (
        <DiagnosisStartPage
          onStart={() => handleNavigate("image-input")}
          onBack={handleBack}
          onHome={handleTopbarHomeClick}
        />
      )}

      {currentPage === "image-input" && (
        <ImageInputPage
          onNext={() => handleNavigate("voice-input")}
          onBack={handleBack}
          onHome={handleTopbarHomeClick}
        />
      )}

      {currentPage === "voice-input" && (
        <VoiceInputPage
          onNext={() => handleNavigate("preference-test")}
          onBack={handleBack}
          onHome={handleTopbarHomeClick}
        />
      )}

      {currentPage === "preference-test" && (
        <PreferenceTestPage
          onNext={() => handleNavigate("review-inputs")}
          onBack={handleBack}
          onHome={handleTopbarHomeClick}
        />
      )}

      {currentPage === "review-inputs" && (
        <ReviewInputsPage
          onConfirm={async () => {
            handleNavigateWithoutHistory("analyzing");
            const isSuccess = await runPersonaDiagnosis();
            if (currentPageRef.current !== "analyzing") return;
            handleNavigateWithoutHistory(isSuccess ? "diagnosis-result" : "review-inputs");
          }}
          onBack={handleBack}
          onHome={handleTopbarHomeClick}
        />
      )}

      {currentPage === "analyzing" && (
        <AnalyzingPage
          progress={diagnosisProgress.progress}
          message={diagnosisProgress.message}
          status={diagnosisProgress.status}
          queuePosition={diagnosisProgress.queuePosition}
          onBack={handleBack}
          onHome={handleTopbarHomeClick}
        />
      )}

      {currentPage === "diagnosis-result" && (
        <DiagnosisResultPage
          result={latestDiagnosisResult}
          onSave={handleDiagnosisSave}
          onRecreate={() => handleNavigate("diagnosis-start")}
          onBack={handleBackSkipLoading}
          onHome={handleTopbarHomeClick}
          onNavigateToSignup={() => handleNavigate("signup")}
          onNavigateToLogin={() => handleNavigate("login")}
        />
      )}

      {currentPage === "save-complete" && (
        <SaveResultCompletePage
          onGoToPersona={() => handleNavigate("persona-list")}
          onCreateContent={() => handleNavigate("content-aspect-ratio", { autoSelectPersonaForContent: true })}
          onHome={handleTopbarHomeClick}
          onBack={handleBack}
        />
      )}

      {currentPage === "persona-list" && (
        <PersonaListPage
          onPersonaClick={(code) => {
            setSelectedPersonaCode(code);
            handleNavigate("persona-detail");
          }}
          onCreateNew={() => handleNavigate("diagnosis-start")}
          onTabChange={handleTabChange}
          onBack={handleBack}
          onHome={handleTopbarHomeClick}
        />
      )}

      {currentPage === "persona-detail" && (
        <PersonaDetailPage
          personaCode={selectedPersonaCode}
          onDelete={() => handleNavigate("persona-list")}
          onCreateContent={() => handleNavigate("content-aspect-ratio", { autoSelectPersonaForContent: true })}
          onBack={handleBack}
          onTabChange={handleTabChange}
          onHome={handleTopbarHomeClick}
          onViewAllContents={() => handleNavigate("persona-saved-contents")}
        />
      )}

      {currentPage === "persona-saved-contents" && (
        <PersonaSavedContentsPage
          personaCode={selectedPersonaCode}
          onBack={handleBack}
          onTabChange={handleTabChange}
          onHome={handleTopbarHomeClick}
          onCreateContent={() => handleNavigate("content-aspect-ratio", { autoSelectPersonaForContent: true })}
        />
      )}

      {currentPage === "persona-content-gallery" && (
        <PersonaContentGalleryPage onBack={handleBack} onHome={handleTopbarHomeClick} />
      )}

      {currentPage === "content-explore" && (
        <ContentExplorePage
          onBack={handleBack}
          onNavigate={handleNavigate}
          onHome={handleTopbarHomeClick}
          onSelectReference={handleStartTrendingContentFlow}
        />
      )}

      {currentPage === "content-aspect-ratio" && (
        <ContentAspectRatioPage
          onNext={(ratio) => {
            setSelectedRatio(ratio);

            if (selectedTrendReferenceId !== null) {
              if (!selectedPersonaCode) {
                setContentGenerationError("Please select a persona before generating content.");
                handleNavigate("content-select-persona");
                return;
              }
              setIsRegeneratingContent(false);
              setContentGenerationError("");
              handleNavigateWithoutHistory("content-generating");
              void runContentGeneration(ratio, selectedPersonaCode);
              return;
            }

            if (isRegeneratingContent) {
              setIsRegeneratingContent(false);
              setContentGenerationError("");
              handleNavigateWithoutHistory("content-generating");
              void runContentGeneration(ratio, selectedPersonaCode);
            } else if (autoSelectPersonaForContent) {
              if (!selectedPersonaCode) {
                setContentGenerationError("콘텐츠 생성에 페르소나를 먼저 선택해 주세요.");
                handleNavigate("content-select-persona");
                return;
              }
              setContentGenerationError("");
              handleNavigateWithoutHistory("content-generating");
              void runContentGeneration(ratio, selectedPersonaCode);
            } else {
              handleNavigate("content-select-persona");
            }
          }}
          onBack={handleBack}
          onHome={handleTopbarHomeClick}
          skipPersonaSelection={isRegeneratingContent || autoSelectPersonaForContent}
        />
      )}

      {currentPage === "content-select-persona" && (
        <ContentSelectPersonaPage
          onNext={(personaCode) => {
            setSelectedPersonaCode(personaCode);
            setContentGenerationError("");
            if (selectedTrendReferenceId !== null) {
              handleNavigate("content-aspect-ratio");
              return;
            }
            handleNavigateWithoutHistory("content-generating");
            void runContentGeneration(selectedRatio, personaCode);
          }}
          onBack={handleBack}
          onHome={handleTopbarHomeClick}
        />
      )}

      {currentPage === "content-generating" && (
        <ContentGeneratingPage
          errorMessage={contentGenerationError}
          progress={contentProgress.progress}
          statusMessage={contentProgress.message}
          status={contentProgress.status}
          queuePosition={contentProgress.queuePosition}
          onRetry={() => void runContentGeneration(selectedRatio, selectedPersonaCode)}
          onBack={handleBack}
          onHome={handleTopbarHomeClick}
        />
      )}

      {currentPage === "content-result" && (
        <ContentResultPage
          ratio={selectedRatio}
          generatedContent={latestGeneratedContent}
          onSave={() => handleNavigate(selectedPersonaCode ? "persona-detail" : "persona-list")}
          onRegenerate={() => {
            setIsRegeneratingContent(true);
            setAutoSelectPersonaForContent(false);
            setLatestGeneratedContent(null);
            setContentGenerationError("");
            handleNavigate("content-aspect-ratio", { autoSelectPersonaForContent: false });
          }}
          onBack={handleBackSkipLoading}
          onHome={handleTopbarHomeClick}
          onViewPersona={() => handleNavigate(selectedPersonaCode ? "persona-detail" : "persona-list")}
          onViewContentList={() =>
            handleNavigate(selectedPersonaCode ? "persona-saved-contents" : "persona-list")
          }
        />
      )}

      {currentPage === "saved-templates" && (
        <SavedTemplatesPage onBack={handleBack} onNavigate={handleNavigate} />
      )}

      {currentPage === "settings" && <SettingsPage onBack={handleBack} onNavigate={handleNavigate} />}

      {currentPage === "help" && <HelpPage onBack={handleBack} onNavigate={handleNavigate} />}

      {!isAdminPage && (
        <HamburgerMenu
          isOpen={isGlobalMenuOpen}
          onClose={() => setIsGlobalMenuOpen(false)}
          onNavigate={handleGlobalMenuNavigate}
          currentPage={currentPage}
        />
      )}

      {showLeaveDiagnosisWarning && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-end justify-center p-5">
          <div className="w-full max-w-[360px] rounded-[24px] bg-white p-6 shadow-2xl border border-[#ececec]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#fff3f5] flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#EF466F]" />
              </div>
              <p className="font-['NEXON_Football_Gothic'] text-[18px] text-black">진단 진행 중</p>
            </div>
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666] leading-[1.6] mb-5">
              지금 메인으로 이동하면 현재 진단 결과를 이어서 확인할 수 없습니다. 홈으로 이동할까요?
            </p>
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setShowLeaveDiagnosisWarning(false);
                  handleNavigateToHome();
                }}
                className="w-full h-[48px] rounded-[14px] bg-black text-white font-['Noto_Sans_KR'] font-semibold text-[14px]"
              >
                확인
              </button>
              <button
                onClick={() => setShowLeaveDiagnosisWarning(false)}
                className="w-full h-[44px] rounded-[12px] bg-[#f7f7f7] text-[#555] font-['Noto_Sans_KR'] text-[13px]"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {loginGateMessage && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-end justify-center p-5">
          <div className="w-full max-w-[360px] rounded-[24px] bg-white p-6 shadow-2xl border border-[#ececec]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#fff3f5] flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#EF466F]" />
              </div>
              <p className="font-['NEXON_Football_Gothic'] text-[18px] text-black">로그인 필요</p>
            </div>
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666] leading-[1.6] mb-5">
              {loginGateMessage}
            </p>
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setLoginGateMessage(null);
                  handleNavigate("login");
                }}
                className="w-full h-[48px] rounded-[14px] bg-black text-white font-['Noto_Sans_KR'] font-semibold text-[14px]"
              >
                로그인
              </button>
              <button
                onClick={() => {
                  setLoginGateMessage(null);
                  handleNavigate("signup");
                }}
                className="w-full h-[48px] rounded-[14px] border border-[#e5e5e5] bg-white text-black font-['Noto_Sans_KR'] font-semibold text-[14px]"
              >
                회원가입
              </button>
              <button
                onClick={() => setLoginGateMessage(null)}
                className="w-full h-[44px] rounded-[12px] bg-[#f7f7f7] text-[#555] font-['Noto_Sans_KR'] text-[13px]"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}


