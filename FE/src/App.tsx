import { useEffect, useState } from "react";
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
import { saveNewPersona } from "./features/persona/lib/personaApi";
import { getPendingPersonaCode } from "./features/persona/lib/personaShareCode";
import { isAuthenticated } from "./lib/auth";

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
  | "help";

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

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [activeTab, setActiveTab] = useState<"home" | "persona" | "content">("home");
  const [pageHistory, setPageHistory] = useState<Page[]>(["home"]);
  const [selectedRatio, setSelectedRatio] = useState<string>("4:5");
  const [isRegeneratingContent, setIsRegeneratingContent] = useState<boolean>(false);
  const [loginGateMessage, setLoginGateMessage] = useState<string | null>(null);
  const [selectedPersonaCode, setSelectedPersonaCode] = useState<string>("");

  const loggedIn = isAuthenticated();

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
    if (canAccessPage(currentPage)) return;

    setPageHistory(["home"]);
    setCurrentPage("home");
    setActiveTab("home");
  }, [currentPage, loggedIn]);

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
    if (getPendingPersonaCode()) {
      handleNavigate("persona-list");
      return;
    }
    handleNavigate("home");
  };

  const handleLoginComplete = () => {
    if (getPendingPersonaCode()) {
      handleNavigate("persona-list");
      return;
    }
    handleNavigate("home");
  };

  const handleDiagnosisSave = async ({ code, name }: { code: string; name: string }) => {
    const saved = await saveNewPersona(code, name);
    const savedPersona = saved.find((item) => item.code === code) ?? saved[0];

    if (savedPersona?.code) {
      setSelectedPersonaCode(savedPersona.code);
    } else {
      setSelectedPersonaCode(code);
    }

    handleNavigate("save-complete");
  };

  return (
    <div className="min-h-screen bg-white">
      {currentPage === "login" && (
        <LoginPage onLogin={handleLoginComplete} onNavigate={handleNavigate} onBack={handleBack} />
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
          onSkip={() => handleNavigate("voice-input")}
          onBack={handleBack}
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === "voice-input" && (
        <VoiceInputPage
          onNext={() => handleNavigate("preference-test")}
          onSkip={() => handleNavigate("preference-test")}
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
          onConfirm={() => handleNavigateWithoutHistory("analyzing")}
          onBack={handleBack}
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === "analyzing" && <AnalyzingPage onComplete={() => handleNavigate("diagnosis-result")} />}

      {currentPage === "diagnosis-result" && (
        <DiagnosisResultPage
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
              handleNavigateWithoutHistory("content-generating");
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
            handleNavigateWithoutHistory("content-generating");
          }}
          onBack={handleBack}
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === "content-generating" && (
        <ContentGeneratingPage onComplete={() => handleNavigate("content-result")} />
      )}

      {currentPage === "content-result" && (
        <ContentResultPage
          ratio={selectedRatio}
          onSave={() => handleNavigate(selectedPersonaCode ? "persona-detail" : "persona-list")}
          onRegenerate={() => {
            setIsRegeneratingContent(true);
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
  );
}
