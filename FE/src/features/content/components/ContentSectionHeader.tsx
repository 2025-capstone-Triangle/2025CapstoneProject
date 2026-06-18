interface ContentSectionHeaderProps {
  title: string;
  description: string;
}

export function ContentSectionHeader({ title, description }: ContentSectionHeaderProps) {
  return (
    <div className="mb-6 md:mb-7">
      <h2 className="mb-2 font-['Noto_Sans_KR'] text-[clamp(24px,4vw,32px)] font-bold leading-tight tracking-[-0.015em] text-black">
        {title}
      </h2>
      <p className="font-['Noto_Sans_KR'] text-[clamp(13px,1.8vw,15px)] font-medium text-[#6b7280]">{description}</p>
    </div>
  );
}
