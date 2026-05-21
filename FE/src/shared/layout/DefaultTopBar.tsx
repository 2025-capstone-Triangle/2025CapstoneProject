import { Icon } from "@iconify/react";
import { Menu } from "lucide-react";

interface DefaultTopBarProps {
  title?: string;
  onTitleClick?: () => void;
  showNotification?: boolean;
  showNotificationBadge?: boolean;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
}

export function DefaultTopBar({
  title = "Person:a",
  onTitleClick,
  showNotification = true,
  showNotificationBadge = false,
  onMenuClick,
  onNotificationClick,
}: DefaultTopBarProps) {
  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick();
      return;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("app:menu:open"));
    }
  };

  const handleTitleClick = () => {
    if (onTitleClick) {
      onTitleClick();
      return;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("app:topbar-home-click"));
    }
  };

  return (
    <div className="sticky top-0 z-40 shrink-0 px-4 md:px-6 xl:px-8">
      <header className="rounded-b-[14px] border border-white/70 bg-white/78 shadow-[0_10px_28px_rgba(15,23,42,0.10)] backdrop-blur-xl md:rounded-b-[20px]">
        <div className="flex items-center justify-between px-6 pb-3 pt-3 md:px-8 md:pb-3 md:pt-3 lg:px-10">
          <button
            type="button"
            className="group relative flex h-12 w-12 transform-gpu items-center justify-center overflow-hidden rounded-full border border-[#dbe1e8] bg-white/70 shadow-[0_4px_14px_rgba(15,23,42,0.10)] backdrop-blur-md transition-[transform,border-color,box-shadow,background-color] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.05] hover:border-[#111827]/25 hover:bg-white/90 hover:shadow-[0_10px_22px_rgba(15,23,42,0.14)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 md:h-[52px] md:w-[52px]"
            aria-label="메뉴"
            onClick={handleMenuClick}
          >
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.7),rgba(255,255,255,0))] opacity-70 transition-opacity duration-250 group-hover:opacity-100" />
            <span className="pointer-events-none absolute inset-[1px] rounded-full border border-white/80" />
            <Menu
              className="relative h-[19px] w-[19px] text-[#1f2937] transition-[color,transform] duration-250 ease-out group-hover:scale-[1.04] group-hover:text-[#0f172a] md:h-5 md:w-5"
              strokeWidth={2.15}
            />
          </button>

          <button
            type="button"
            onClick={handleTitleClick}
            className="rounded-[10px] px-2 py-1 transition-colors duration-200 hover:bg-black/[0.04]"
          >
            <h1 className="topbar-title-gothic font-serifkr text-[24px] font-black leading-none tracking-[0.15px] text-[#161616] md:text-[28px]">
              {title}
            </h1>
          </button>

          {showNotification ? (
            <button
              type="button"
              className="group relative flex h-12 w-12 transform-gpu items-center justify-center overflow-hidden rounded-full border border-[#dbe1e8] bg-white/70 shadow-[0_4px_14px_rgba(15,23,42,0.10)] backdrop-blur-md transition-[transform,border-color,box-shadow,background-color] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.05] hover:border-[#111827]/25 hover:bg-white/90 hover:shadow-[0_10px_22px_rgba(15,23,42,0.14)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 md:h-[52px] md:w-[52px]"
              aria-label="알림"
              onClick={onNotificationClick}
            >
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.7),rgba(255,255,255,0))] opacity-70 transition-opacity duration-250 group-hover:opacity-100" />
              <span className="pointer-events-none absolute inset-[1px] rounded-full border border-white/80" />
              <Icon
                icon="ph:bell-simple"
                className="relative h-6 w-6 text-[#1f2937] transition-colors duration-250 ease-out group-hover:text-[#0f172a]"
              />
              {showNotificationBadge ? (
                <span className="absolute right-[10px] top-[10px] h-[8px] w-[8px] rounded-full bg-[#ef466f] ring-[1.5px] ring-white md:right-[11px] md:top-[11px]" />
              ) : null}
            </button>
          ) : (
            <div className="h-12 w-12 md:h-[52px] md:w-[52px]" />
          )}
        </div>
      </header>
    </div>
  );
}
