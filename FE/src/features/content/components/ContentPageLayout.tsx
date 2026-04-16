import type { ReactNode } from "react";
import { BackButton } from "../../../shared/layout/BackButton";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";

interface ContentPageLayoutProps {
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
  scrollContent?: boolean;
  showNotification?: boolean;
}

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function ContentPageLayout({
  children,
  bottom,
  onBack,
  onHome,
  rootClassName,
  pageMaxWidthClassName = "max-w-[1320px]",
  contentMaxWidthClassName = "max-w-[980px]",
  contentClassName,
  bottomMaxWidthClassName,
  bottomWrapperClassName,
  scrollContent = true,
  showNotification = true,
}: ContentPageLayoutProps) {
  const contentBaseClassName = joinClassNames(
    "mx-auto flex-1 min-h-0 w-full",
    contentMaxWidthClassName,
    contentClassName,
  );

  const contentNodeWithBack = (
    <div className={contentBaseClassName}>
      {onBack ? <BackButton onClick={onBack} /> : null}
      {children}
    </div>
  );

  return (
    <div
      className={joinClassNames(
        "content-page-root content-pretendard relative mx-auto flex h-[100dvh] min-h-[100dvh] w-full flex-col overflow-hidden bg-white md:h-full md:min-h-0",
        pageMaxWidthClassName,
        rootClassName,
      )}
    >
      <DefaultTopBar onTitleClick={onHome} showNotification={showNotification} />

      {scrollContent ? (
        <div className="page-scroll">{contentNodeWithBack}</div>
      ) : (
        <div className="content-content-frame">{contentNodeWithBack}</div>
      )}

      {bottom ? (
        <div
          className={joinClassNames(
            "fixed inset-x-0 bottom-0 z-20 mx-auto w-full border-t border-white/70 bg-white/82 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur md:absolute",
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
