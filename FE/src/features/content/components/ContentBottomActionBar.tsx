interface ContentBottomActionBarProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  maxWidthClassName?: string;
}

export function ContentBottomActionBar({
  label,
  onClick,
  disabled,
  maxWidthClassName = "max-w-[980px]",
}: ContentBottomActionBarProps) {
  return (
    <div className={`mx-auto w-full ${maxWidthClassName} px-4 py-4 sm:px-8 md:px-10 md:pb-8 md:pt-3`}>
      <button
        onClick={onClick}
        disabled={disabled}
        className="flex h-[52px] w-full items-center justify-center rounded-[16px] bg-black font-['Noto_Sans_KR'] text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#1a1a1a] disabled:opacity-50 sm:h-[56px] sm:text-[16px]"
      >
        {label}
      </button>
    </div>
  );
}

