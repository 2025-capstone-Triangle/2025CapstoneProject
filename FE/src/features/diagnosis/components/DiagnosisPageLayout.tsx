import type { ReactNode } from "react";
import { BackButton } from "../../../shared/layout/BackButton";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";

interface DiagnosisPageLayoutProps {
  children: ReactNode;
  bottom?: ReactNode;
  onBack?: () => void;
  onHome?: () => void;
  rootClassName?: string;
  pageMaxWidthClassName?: string;
  contentMaxWidthClassName?: string;
  contentClassName?: string;
  bottomMaxWidthClassName?: string;
  bottomWrapperClassName?: string;
  showNotification?: boolean;
  scrollContent?: boolean;
}

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function DiagnosisPageLayout({
  children,
  bottom,
  onBack,
  onHome,
  rootClassName,
  pageMaxWidthClassName = "max-w-[1320px]",
  contentMaxWidthClassName = "max-w-[760px]",
  contentClassName,
  bottomMaxWidthClassName,
  bottomWrapperClassName,
  showNotification = false,
  scrollContent = false,
}: DiagnosisPageLayoutProps) {
  const contentBaseClassName = joinClassNames(
    "mx-auto flex-1 min-h-0 w-full",
    contentMaxWidthClassName,
    contentClassName,
  );

  const contentNode = (
    <div className={contentBaseClassName}>
      {children}
    </div>
  );

  return (
    <div
      className={joinClassNames(
        "diag-page-root mx-auto flex h-full min-h-[100dvh] w-full flex-col overflow-hidden bg-white md:min-h-0",
        pageMaxWidthClassName,
        rootClassName,
      )}
    >
      <DefaultTopBar onTitleClick={onHome} showNotification={showNotification} />
      <BackButton onClick={onBack} />

      {scrollContent ? <div className="page-scroll">{contentNode}</div> : <div className="min-h-0 overflow-hidden">{contentNode}</div>}

      {bottom ? (
        <div
          className={joinClassNames(
            "fixed inset-x-0 bottom-0 z-20 mx-auto w-full border-t border-[#f0f0f0] bg-white/95 backdrop-blur",
            pageMaxWidthClassName,
            bottomWrapperClassName,
          )}
        >
          <div
            className={joinClassNames(
              "mx-auto fixed-bottom-safe",
              bottomMaxWidthClassName ?? contentMaxWidthClassName,
            )}
          >
            {bottom}
          </div>
        </div>
      ) : null}
    </div>
  );
}
