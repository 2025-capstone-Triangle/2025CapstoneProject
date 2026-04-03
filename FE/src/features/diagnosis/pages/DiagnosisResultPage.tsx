import { DiagnosisPageLayout } from "../components/DiagnosisPageLayout";
import { GuestSaveCodeModal } from "../components/result/GuestSaveCodeModal";
import { ResultActionBar } from "../components/result/ResultActionBar";
import { ResultEmptyState } from "../components/result/ResultEmptyState";
import { ResultHeroCard } from "../components/result/ResultHeroCard";
import { ResultInfoSections } from "../components/result/ResultInfoSections";
import { ResultStatusBadge } from "../components/result/ResultStatusBadge";
import { useDiagnosisResult } from "../hooks/useDiagnosisResult";
import { type PersonaResponse } from "../../persona/lib/personaApi";

interface DiagnosisResultPageProps {
  result?: PersonaResponse | null;
  mode?: "diagnosis" | "view";
  onSave?: (payload: { code: string; name: string }) => Promise<void> | void;
  onRecreate?: () => void;
  onBack?: () => void;
  onHome?: () => void;
  onNavigateToSignup?: () => void;
  onNavigateToLogin?: () => void;
  viewLeftActionLabel?: string;
  viewLeftAction?: () => void;
  viewRightActionLabel?: string;
  viewRightAction?: () => void;
  statusBadgeLabel?: string;
  onEditName?: () => void;
}

export function DiagnosisResultPage({
  result,
  mode = "diagnosis",
  onSave,
  onRecreate,
  onBack,
  onHome,
  onNavigateToSignup,
  onNavigateToLogin,
  viewLeftActionLabel = "목록으로",
  viewLeftAction,
  viewRightActionLabel = "콘텐츠 만들기",
  viewRightAction,
  statusBadgeLabel,
  onEditName,
}: DiagnosisResultPageProps) {
  const diagnosisResult = useDiagnosisResult({
    result,
    onSave,
    onNavigateToSignup,
    onNavigateToLogin,
  });

  return (
    <>
      <DiagnosisPageLayout
        onBack={onBack}
        onHome={onHome}
        scrollContent
        contentMaxWidthClassName="max-w-[1120px]"
        contentClassName="px-5 pt-2 pb-28 sm:px-8 md:pb-28 lg:px-10"
        bottomMaxWidthClassName="max-w-[1120px]"
        bottom={
          result ? (
            <ResultActionBar
              mode={mode}
              saveError={diagnosisResult.saveError}
              isSaving={diagnosisResult.isSaving}
              onRecreate={onRecreate}
              onSave={diagnosisResult.handleSaveClick}
              viewLeftActionLabel={viewLeftActionLabel}
              viewRightActionLabel={viewRightActionLabel}
              onViewLeftAction={viewLeftAction ?? onBack}
              onViewRightAction={viewRightAction}
            />
          ) : null
        }
      >
        {!result ? (
          <ResultEmptyState onRetry={onRecreate} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-5">
            <div className="lg:sticky lg:top-0">
              <ResultStatusBadge mode={mode} customLabel={statusBadgeLabel} />
              <div className="rounded-[24px] border border-[#eceff3] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)] sm:p-5">
                <ResultHeroCard
                  imageUrl={diagnosisResult.selectedImage}
                  personaName={diagnosisResult.personaName}
                  liked={diagnosisResult.liked}
                  onToggleLike={diagnosisResult.toggleLiked}
                  onDownload={diagnosisResult.handleDownloadThumbnail}
                />
              </div>
            </div>

            <ResultInfoSections
              mode={mode}
              personaName={diagnosisResult.personaName}
              keywords={diagnosisResult.keywords}
              colors={diagnosisResult.colors}
              description={diagnosisResult.personaDescription}
              traitsDetail={diagnosisResult.traitsDetail}
              showDetails={diagnosisResult.showDetails}
              onToggleDetails={diagnosisResult.toggleDetails}
              onEditName={onEditName}
              onCopyColor={diagnosisResult.handleCopyColor}
            />
          </div>
        )}
      </DiagnosisPageLayout>

      <GuestSaveCodeModal
        open={mode === "diagnosis" && diagnosisResult.showGuestCodeModal}
        code={diagnosisResult.guestPersonaCode}
        copied={diagnosisResult.copyDone}
        onClose={() => diagnosisResult.setShowGuestCodeModal(false)}
        onCopy={diagnosisResult.handleCopyCode}
        onMoveToSignup={diagnosisResult.handleMoveToSignup}
        onMoveToLogin={diagnosisResult.handleMoveToLogin}
      />
    </>
  );
}
