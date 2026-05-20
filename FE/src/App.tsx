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
const DEFAULT_DIAGNOSIS_PROGRESS: DiagnosisProgressState = {
  sessionId: "",
  progress: 0,
  message: "AI媛 ?섎Ⅴ?뚮굹瑜?遺꾩꽍?섍퀬 ?덉뒿?덈떎...",
  step: "idle",
  queuePosition: null,
  connected: false,
  status: "idle",
};

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

function getInitialAppBootstrap() {
  const storedDiagnosisResult = getStoredDiagnosisResult();
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
    };
  }

  const defaultPage = isAuthenticated() && isAdminAuth() ? "admin" : "home";
  return {
    page: defaultPage as Page,
    history: [defaultPage as Page],
    diagnosisCode: "",
    diagnosisResult: null as PersonaResponse | null,
  };
}

export default function App() {
  const [bootstrap] = useState(() => getInitialAppBootstrap());
  const [currentPage, setCurrentPage] = useState<Page>(bootstrap.page);
  const [activeTab, setActiveTab] = useState<"home" | "persona" | "content">("home");
  const [pageHistory, setPageHistory] = useState<Page[]>(bootstrap.history);
  const [selectedRatio, setSelectedRatio] = useState<string>("4:5");
  const [isRegeneratingContent, setIsRegeneratingContent] = useState<boolean>(false);
  const [autoSelectPersonaForContent, setAutoSelectPersonaForContent] = useState<boolean>(false);
  const [contentGenerationError, setContentGenerationError] = useState<string>("");
  const [latestGeneratedContent, setLatestGeneratedContent] = useState<ContentCreateResponse | null>(null);
  const [selectedTrendReferenceId, setSelectedTrendReferenceId] = useState<number | null>(null);
  const [loginGateMessage, setLoginGateMessage] = useState<string | null>(null);
  const [selectedPersonaCode, setSelectedPersonaCode] = useState<string>("");
  const [latestDiagnosisCode, setLatestDiagnosisCode] = useState<string>(bootstrap.diagnosisCode);
  const [latestDiagnosisResult, setLatestDiagnosisResult] = useState<PersonaResponse | null>(bootstrap.diagnosisResult);
  const [diagnosisProgress, setDiagnosisProgress] = useState<DiagnosisProgressState>(DEFAULT_DIAGNOSIS_PROGRESS);
  const previousPageRef = useRef<Page>(currentPage);
  const isAdminPage = currentPage === "admin";

  const loggedIn = isAuthenticated();

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

  const handleNavigateToHome = () => {
    setPageHistory(["home"]);
    setCurrentPage("home");
    setActiveTab("home");
    setDiagnosisProgress(DEFAULT_DIAGNOSIS_PROGRESS);
    setAutoSelectPersonaForContent(false);
    setSelectedTrendReferenceId(null);
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
      setLoginGateMessage("?몄뀡??留뚮즺?섏뿀?듬땲?? ?ㅼ떆 濡쒓렇?명빐 二쇱꽭??");
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
          message: "?낅젰 ?곗씠?곌? 遺議깊빀?덈떎. ?대?吏/?뚯꽦/?좏샇 ?뚯뒪?몃? ?뺤씤??二쇱꽭??",
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
              message: prev.message || "AI媛 ?섎Ⅴ?뚮굹瑜?遺꾩꽍?섍퀬 ?덉뒿?덈떎...",
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
                : "吏꾨떒 ?붿껌???묒닔?섏뼱 ?湲곗뿴???깅줉?섏뿀?듬땲??";

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
          if (!connectAcked) {
            rejectConnect?.(error);
            return;
          }

          setDiagnosisProgress((prev) => ({
            ...prev,
            status: "error",
            message: error.message || "吏꾨떒 吏꾪뻾 ?곌껐??遺덉븞?뺥빀?덈떎. ?좎떆 ???ㅼ떆 ?쒕룄??二쇱꽭??",
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

      if (result?.code) {
        setLatestDiagnosisResult(result);
        setLatestDiagnosisCode(result.code);
        setDiagnosisProgress((prev) => ({
          ...prev,
          progress: 100,
          status: "completed",
          message: "?섎Ⅴ?뚮굹 吏꾨떒???꾨즺?섏뿀?듬땲??",
          step: "completed",
          queuePosition: null,
          connected: prev.connected,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("[persona.diagnosis]", error);
      setLatestDiagnosisCode("");
      setLatestDiagnosisResult(null);
      setDiagnosisProgress((prev) => ({
        ...prev,
        status: "error",
        message: error instanceof Error ? error.message : "吏꾨떒 ?붿껌???ㅽ뙣?덉뒿?덈떎.",
        step: "error",
      }));
      return false;
    } finally {
      if (connectTimeout !== null) {
        window.clearTimeout(connectTimeout);
      }
      closeProgressStream?.();
    }
  };

  const runContentGeneration = async (ratio: string, personaCode: string) => {
    if (!personaCode) {
      setContentGenerationError("?앹꽦???섎Ⅴ?뚮굹瑜?癒쇱? ?좏깮??二쇱꽭??");
      return;
    }

    setContentGenerationError("");
    setLatestGeneratedContent(null);

    try {
      const result = await createContent({
        code: personaCode,
        type: getContentTypeByRatio(ratio),
      });
      setLatestGeneratedContent(result);
      handleNavigate("content-result");
    } catch (error) {
      const message = error instanceof Error ? error.message : "肄섑뀗痢??앹꽦???ㅽ뙣?덉뒿?덈떎.";
      setContentGenerationError(message);
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
          onTabChange={handleTabChange}
          onSelectTrendingReference={handleStartTrendingContentFlow}
        />
      )}

      {currentPage === "diagnosis-start" && (
        <DiagnosisStartPage
          onStart={() => handleNavigate("image-input")}
          onBack={handleBack}
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === "image-input" && (
        <ImageInputPage
          onNext={() => handleNavigate("voice-input")}
          onBack={handleBack}
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === "voice-input" && (
        <VoiceInputPage
          onNext={() => handleNavigate("preference-test")}
          onBack={handleBack}
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === "preference-test" && (
        <PreferenceTestPage
          onNext={() => handleNavigate("review-inputs")}
          onBack={handleBack}
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === "review-inputs" && (
        <ReviewInputsPage
          onConfirm={async () => {
            handleNavigateWithoutHistory("analyzing");
            const isSuccess = await runPersonaDiagnosis();
            handleNavigateWithoutHistory(isSuccess ? "diagnosis-result" : "review-inputs");
          }}
          onBack={handleBack}
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === "analyzing" && (
        <AnalyzingPage
          progress={diagnosisProgress.progress}
          message={diagnosisProgress.message}
          status={diagnosisProgress.status}
          queuePosition={diagnosisProgress.queuePosition}
          onBack={handleBack}
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === "diagnosis-result" && (
        <DiagnosisResultPage
          result={latestDiagnosisResult}
          onSave={handleDiagnosisSave}
          onRecreate={() => handleNavigate("diagnosis-start")}
          onBack={handleBackSkipLoading}
          onHome={handleNavigateToHome}
          onNavigateToSignup={() => handleNavigate("signup")}
          onNavigateToLogin={() => handleNavigate("login")}
        />
      )}

      {currentPage === "save-complete" && (
        <SaveResultCompletePage
          onGoToPersona={() => handleNavigate("persona-list")}
          onCreateContent={() => handleNavigate("content-aspect-ratio", { autoSelectPersonaForContent: true })}
          onHome={handleNavigateToHome}
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
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === "persona-detail" && (
        <PersonaDetailPage
          personaCode={selectedPersonaCode}
          onDelete={() => handleNavigate("persona-list")}
          onCreateContent={() => handleNavigate("content-aspect-ratio", { autoSelectPersonaForContent: true })}
          onBack={handleBack}
          onTabChange={handleTabChange}
          onHome={handleNavigateToHome}
          onViewAllContents={() => handleNavigate("persona-saved-contents")}
        />
      )}

      {currentPage === "persona-saved-contents" && (
        <PersonaSavedContentsPage
          personaCode={selectedPersonaCode}
          onBack={handleBack}
          onTabChange={handleTabChange}
          onHome={handleNavigateToHome}
          onCreateContent={() => handleNavigate("content-aspect-ratio", { autoSelectPersonaForContent: true })}
        />
      )}

      {currentPage === "persona-content-gallery" && (
        <PersonaContentGalleryPage onBack={handleBack} onHome={handleNavigateToHome} />
      )}

      {currentPage === "content-explore" && (
        <ContentExplorePage
          onBack={handleBack}
          onNavigate={handleNavigate}
          onHome={handleNavigateToHome}
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
                setContentGenerationError("?앹꽦???섎Ⅴ?뚮굹瑜?癒쇱? ?좏깮??二쇱꽭??");
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
          onHome={handleNavigateToHome}
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
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === "content-generating" && (
        <ContentGeneratingPage
          errorMessage={contentGenerationError}
          onRetry={() => void runContentGeneration(selectedRatio, selectedPersonaCode)}
          onBack={handleBack}
          onHome={handleNavigateToHome}
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
          onHome={handleNavigateToHome}
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

