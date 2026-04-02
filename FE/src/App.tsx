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
import { createContent, type ContentCreateResponse, type ContentType } from "./features/content/lib/contentApi";
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

const SCALE_FIT_PAGES = new Set<Page>([
  "home",
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
  const [contentGenerationError, setContentGenerationError] = useState<string>("");
  const [latestGeneratedContent, setLatestGeneratedContent] = useState<ContentCreateResponse | null>(null);
  const [loginGateMessage, setLoginGateMessage] = useState<string | null>(null);
  const [selectedPersonaCode, setSelectedPersonaCode] = useState<string>("");
  const [latestDiagnosisCode, setLatestDiagnosisCode] = useState<string>(bootstrap.diagnosisCode);
  const [latestDiagnosisResult, setLatestDiagnosisResult] = useState<PersonaResponse | null>(bootstrap.diagnosisResult);
  const previousPageRef = useRef<Page>(currentPage);
  const isAdminPage = currentPage === "admin";

  const loggedIn = isAuthenticated();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    const syncFitScale = () => {
      if (!SCALE_FIT_PAGES.has(currentPage) || window.innerWidth < 768) {
        root.style.setProperty("--page-fit-scale", "1");
        root.style.setProperty("--page-fit-extra-space", "0px");
        return;
      }

      const stage = document.querySelector<HTMLElement>(".app-shell-stage");
      const page = document.querySelector<HTMLElement>(".home-page-root, .diag-page-root");
      if (!stage || !page) {
        root.style.setProperty("--page-fit-scale", "1");
        root.style.setProperty("--page-fit-extra-space", "0px");
        return;
      }

      // Measure natural content size first, then compute the tightest fit scale.
      root.style.setProperty("--page-fit-scale", "1");
      const availableWidth = Math.max(stage.clientWidth, 1);
      const availableHeight = Math.max(stage.clientHeight, 1);
      const pageRect = page.getBoundingClientRect();

      let maxRight = pageRect.left;
      let maxBottom = pageRect.top;

      const nodes = page.querySelectorAll<HTMLElement>("*");
      nodes.forEach((node) => {
        const style = window.getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden") return;

        const rect = node.getBoundingClientRect();
        if (!Number.isFinite(rect.right) || !Number.isFinite(rect.bottom)) return;

        maxRight = Math.max(maxRight, rect.right);
        maxBottom = Math.max(maxBottom, rect.bottom);
      });

      const contentWidth = Math.max(page.scrollWidth, page.offsetWidth, maxRight - pageRect.left, 1);
      const contentHeight = Math.max(page.scrollHeight, page.offsetHeight, maxBottom - pageRect.top, 1);

      const scaleByWidth = availableWidth / contentWidth;
      const scaleByHeight = availableHeight / contentHeight;
      const nextScale = Math.min(1, scaleByWidth, scaleByHeight);
      const clampedScale = Math.max(0.54, nextScale);
      root.style.setProperty("--page-fit-scale", clampedScale.toFixed(4));
      const extraUnscaledSpace = Math.max(0, availableHeight / clampedScale - contentHeight);
      root.style.setProperty("--page-fit-extra-space", `${extraUnscaledSpace.toFixed(2)}px`);
    };

    const syncFitScaleInFrame = () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(syncFitScale);
      });
    };

    syncFitScaleInFrame();
    const timeoutId = window.setTimeout(syncFitScaleInFrame, 180);
    window.addEventListener("resize", syncFitScaleInFrame);
    window.addEventListener("orientationchange", syncFitScaleInFrame);
    window.addEventListener("load", syncFitScaleInFrame);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", syncFitScaleInFrame);
      window.removeEventListener("orientationchange", syncFitScaleInFrame);
      window.removeEventListener("load", syncFitScaleInFrame);
      root.style.setProperty("--page-fit-scale", "1");
      root.style.setProperty("--page-fit-extra-space", "0px");
    };
  }, [currentPage]);

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

  const handleNavigate = (page: Page) => {
    if (!canAccessPage(page)) {
      requestLoginForPage(page);
      return;
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

  const handleNavigateToHome = () => {
    setPageHistory(["home"]);
    setCurrentPage("home");
    setActiveTab("home");
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
      setLoginGateMessage("세션이 만료되었습니다. 다시 로그인해 주세요.");
      setPageHistory(["home"]);
      setCurrentPage("login");
      setActiveTab("home");
      setLatestDiagnosisCode("");
      setLatestDiagnosisResult(null);
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
      handleNavigate("content-aspect-ratio");
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
    try {
      const images = getStagedDiagnosisImageFiles();
      const voice = getStagedVoiceRecordingFile();
      const preference = getPreferenceTestResult();
      if (!preference || !images.length || !voice) {
        setLatestDiagnosisCode("");
        setLatestDiagnosisResult(null);
        return;
      }
      const { answer, q8_tone } = buildBackendPreferencePayload(preference);
      const profileImage = images[0];
      const result = await diagnosePersona({
        profile: profileImage,
        image: profileImage,
        voice,
        answer,
        q8_tone,
      });
      if (result?.code) {
        setLatestDiagnosisResult(result);
        setLatestDiagnosisCode(result.code);
      }
    } catch (error) {
      console.error("[persona.diagnosis]", error);
      setLatestDiagnosisCode("");
      setLatestDiagnosisResult(null);
    }
  };

  const runContentGeneration = async (ratio: string, personaCode: string) => {
    if (!personaCode) {
      setContentGenerationError("생성할 페르소나를 먼저 선택해 주세요.");
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
      const message = error instanceof Error ? error.message : "콘텐츠 생성에 실패했습니다.";
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
        <HomePage onNavigate={handleNavigate} onTabChange={handleTabChange} />
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
            await runPersonaDiagnosis();
            handleNavigateWithoutHistory("diagnosis-result");
          }}
          onBack={handleBack}
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === "analyzing" && <AnalyzingPage />}

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
          onCreateContent={() => handleNavigate("content-aspect-ratio")}
          onHome={handleNavigateToHome}
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
          onCreateContent={() => handleNavigate("content-aspect-ratio")}
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
          onCreateContent={() => handleNavigate("content-aspect-ratio")}
        />
      )}

      {currentPage === "persona-content-gallery" && (
        <PersonaContentGalleryPage onBack={handleBack} onHome={handleNavigateToHome} />
      )}

      {currentPage === "content-explore" && (
        <ContentExplorePage onBack={handleBack} onNavigate={handleNavigate} onHome={handleNavigateToHome} />
      )}

      {currentPage === "content-aspect-ratio" && (
        <ContentAspectRatioPage
          onNext={(ratio) => {
            setSelectedRatio(ratio);
            if (isRegeneratingContent) {
              setIsRegeneratingContent(false);
              setContentGenerationError("");
              handleNavigateWithoutHistory("content-generating");
              void runContentGeneration(ratio, selectedPersonaCode);
            } else {
              handleNavigate("content-select-persona");
            }
          }}
          onBack={handleBack}
          onHome={handleNavigateToHome}
          skipPersonaSelection={isRegeneratingContent}
        />
      )}

      {currentPage === "content-select-persona" && (
        <ContentSelectPersonaPage
          onNext={(personaCode) => {
            setSelectedPersonaCode(personaCode);
            setContentGenerationError("");
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
            setLatestGeneratedContent(null);
            setContentGenerationError("");
            handleNavigate("content-aspect-ratio");
          }}
          onBack={handleBackSkipLoading}
          onHome={handleNavigateToHome}
          onViewPersona={() => handleNavigate(selectedPersonaCode ? "persona-detail" : "persona-list")}
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

