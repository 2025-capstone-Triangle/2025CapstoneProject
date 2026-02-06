import { useState } from 'react';
import { HomePage } from './features/home/pages/HomePage';
import { DiagnosisStartPage } from './features/diagnosis/pages/DiagnosisStartPage';
import { ImageInputPage } from './features/diagnosis/pages/ImageInputPage';
import { VoiceInputPage } from './features/diagnosis/pages/VoiceInputPage';
import { PreferenceTestPage } from './features/diagnosis/pages/PreferenceTestPage';
import { ReviewInputsPage } from './features/diagnosis/pages/ReviewInputsPage';
import { AnalyzingPage } from './features/diagnosis/pages/AnalyzingPage';
import { DiagnosisResultPage } from './features/diagnosis/pages/DiagnosisResultPage';
import { SaveResultCompletePage } from './features/diagnosis/pages/SaveResultCompletePage';
import { PersonaListPage } from './features/persona/pages/PersonaListPage';
import { PersonaDetailPage } from './features/persona/pages/PersonaDetailPage';
import { PersonaSavedContentsPage } from './features/persona/pages/PersonaSavedContentsPage';
import { PersonaContentGalleryPage } from './features/persona/pages/PersonaContentGalleryPage';
import { ContentExplorePage } from './features/content/pages/ContentExplorePage';
import { ContentAspectRatioPage } from './features/content/pages/ContentAspectRatioPage';
import { ContentSelectPersonaPage } from './features/content/pages/ContentSelectPersonaPage';
import { ContentGeneratingPage } from './features/content/pages/ContentGeneratingPage';
import { ContentResultPage } from './features/content/pages/ContentResultPage';
import { SavedTemplatesPage } from './features/content/pages/SavedTemplatesPage';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { HelpPage } from './features/support/pages/HelpPage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SignupPage } from './features/auth/pages/SignupPage';
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage';

type Page = 
  | 'home' 
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'diagnosis-start' 
  | 'image-input' 
  | 'voice-input' 
  | 'preference-test'
  | 'review-inputs'
  | 'analyzing'
  | 'diagnosis-result'
  | 'save-complete'
  | 'persona-list'
  | 'persona-detail'
  | 'persona-saved-contents'
  | 'persona-content-gallery'
  | 'content-explore'
  | 'content-home'
  | 'content-aspect-ratio'
  | 'content-select-persona'
  | 'content-generating'
  | 'content-result'
  | 'saved-templates'
  | 'settings'
  | 'help';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [activeTab, setActiveTab] = useState<'home' | 'persona' | 'content'>('home');
  const [pageHistory, setPageHistory] = useState<Page[]>(['home']);
  const [selectedRatio, setSelectedRatio] = useState<string>('4:5');
  const [isRegeneratingContent, setIsRegeneratingContent] = useState<boolean>(false); // 재생성 모드 추적

  const handleNavigate = (page: Page) => {
    setPageHistory([...pageHistory, page]);
    setCurrentPage(page);
  };

  // 로딩 페이지용 네비게이션 (히스토리에 추가하지 않음)
  // 로딩 페이지는 중간 과정이므로 뒤로가기 시 건너뛰도록 처리
  const handleNavigateWithoutHistory = (page: Page) => {
    setCurrentPage(page);
  };

  const handleNavigateToHome = () => {
    setPageHistory(['home']);
    setCurrentPage('home');
    setActiveTab('home');
  };

  const handleBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop();
      const previousPage = newHistory[newHistory.length - 1];
      setPageHistory(newHistory);
      setCurrentPage(previousPage);
    } else {
      handleNavigateToHome();
    }
  };

  // 로딩 페이지를 건너뛰는 뒤로가기 (결과 페이지 전용)
  const handleBackSkipLoading = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop(); // 현재 페이지 제거
      
      // 이전 페이지가 로딩 페이지면 한 번 더 제거
      let previousPage = newHistory[newHistory.length - 1];
      if (previousPage === 'analyzing' || previousPage === 'content-generating') {
        newHistory.pop();
        previousPage = newHistory[newHistory.length - 1] || 'home';
      }
      
      setPageHistory(newHistory);
      setCurrentPage(previousPage);
    } else {
      handleNavigateToHome();
    }
  };

  const handleTabChange = (tab: 'home' | 'persona' | 'content') => {
    setActiveTab(tab);
    if (tab === 'home') {
      handleNavigate('home');
    } else if (tab === 'persona') {
      handleNavigate('persona-list');
    } else {
      handleNavigate('content-aspect-ratio');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {currentPage === 'login' && (
        <LoginPage 
          onLogin={() => handleNavigate('home')}
          onNavigate={handleNavigate}
          onBack={handleBack}
        />
      )}

      {currentPage === 'signup' && (
        <SignupPage 
          onBack={handleBack}
          onSignup={() => handleNavigate('home')}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'forgot-password' && (
        <ForgotPasswordPage 
          onBack={handleBack}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'home' && (
        <HomePage 
          onNavigate={handleNavigate}
          onTabChange={handleTabChange}
        />
      )}

      {/* Diagnosis Flow */}
      {currentPage === 'diagnosis-start' && (
        <DiagnosisStartPage
          onStart={() => handleNavigate('image-input')}
          onBack={handleBack}
          onHome={handleNavigateToHome}
        />
      )}
      
      {currentPage === 'image-input' && (
        <ImageInputPage
          onNext={() => handleNavigate('voice-input')}
          onSkip={() => handleNavigate('voice-input')}
          onBack={handleBack}
          onHome={handleNavigateToHome}
        />
      )}
      
      {currentPage === 'voice-input' && (
        <VoiceInputPage
          onNext={() => handleNavigate('preference-test')}
          onSkip={() => handleNavigate('preference-test')}
          onBack={handleBack}
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === 'preference-test' && (
        <PreferenceTestPage
          onNext={() => handleNavigate('review-inputs')}
          onBack={handleBack}
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === 'review-inputs' && (
        <ReviewInputsPage
          onConfirm={() => handleNavigateWithoutHistory('analyzing')}
          onBack={handleBack}
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === 'analyzing' && (
        <AnalyzingPage
          onComplete={() => handleNavigate('diagnosis-result')}
        />
      )}

      {currentPage === 'diagnosis-result' && (
        <DiagnosisResultPage
          onSave={() => handleNavigate('save-complete')}
          onRecreate={() => handleNavigate('diagnosis-start')}
          onBack={handleBackSkipLoading}
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === 'save-complete' && (
        <SaveResultCompletePage
          onGoToPersona={() => handleNavigate('persona-list')}
          onCreateContent={() => handleNavigate('content-aspect-ratio')}
          onHome={handleNavigateToHome}
        />
      )}

      {/* Persona Pages */}
      {currentPage === 'persona-list' && (
        <PersonaListPage
          onPersonaClick={() => handleNavigate('persona-detail')}
          onCreateNew={() => handleNavigate('diagnosis-start')}
          onTabChange={handleTabChange}
          onBack={handleBack}
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === 'persona-detail' && (
        <PersonaDetailPage
          onDelete={() => handleNavigate('persona-list')}
          onCreateContent={() => handleNavigate('content-aspect-ratio')}
          onBack={handleBack}
          onTabChange={handleTabChange}
          onHome={handleNavigateToHome}
          onViewAllContents={() => handleNavigate('persona-content-gallery')}
        />
      )}

      {currentPage === 'persona-saved-contents' && (
        <PersonaSavedContentsPage
          onBack={handleBack}
          onTabChange={handleTabChange}
          onHome={handleNavigateToHome}
          onCreateContent={() => handleNavigate('content-aspect-ratio')}
        />
      )}

      {currentPage === 'persona-content-gallery' && (
        <PersonaContentGalleryPage
          onBack={handleBack}
          onHome={handleNavigateToHome}
        />
      )}

      {/* Content Pages */}
      {currentPage === 'content-explore' && (
        <ContentExplorePage
          onBack={handleBack}
          onNavigate={handleNavigate}
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === 'content-aspect-ratio' && (
        <ContentAspectRatioPage
          onNext={(ratio) => {
            setSelectedRatio(ratio);
            // 재생성 모드면 페르소나 선택 건너뛰고 바로 생성
            if (isRegeneratingContent) {
              setIsRegeneratingContent(false);
              handleNavigateWithoutHistory('content-generating');
            } else {
              handleNavigate('content-select-persona');
            }
          }}
          onBack={handleBack}
          onHome={handleNavigateToHome}
          skipPersonaSelection={isRegeneratingContent}
        />
      )}

      {currentPage === 'content-select-persona' && (
        <ContentSelectPersonaPage
          onNext={() => handleNavigateWithoutHistory('content-generating')}
          onBack={handleBack}
          onHome={handleNavigateToHome}
        />
      )}

      {currentPage === 'content-generating' && (
        <ContentGeneratingPage
          onComplete={() => handleNavigate('content-result')}
        />
      )}

      {currentPage === 'content-result' && (
        <ContentResultPage
          ratio={selectedRatio}
          onSave={() => handleNavigate('persona-detail')}
          onRegenerate={() => {
            setIsRegeneratingContent(true);
            handleNavigate('content-aspect-ratio');
          }}
          onBack={handleBackSkipLoading}
          onHome={handleNavigateToHome}
          onViewPersona={() => handleNavigate('persona-detail')}
        />
      )}

      {currentPage === 'saved-templates' && (
        <SavedTemplatesPage
          onBack={handleBack}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'settings' && (
        <SettingsPage
          onBack={handleBack}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'help' && (
        <HelpPage
          onBack={handleBack}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
