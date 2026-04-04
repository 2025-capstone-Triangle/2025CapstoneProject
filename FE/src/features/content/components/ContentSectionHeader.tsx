interface ContentSectionHeaderProps {
  title: string;
  description: string;
}

export function ContentSectionHeader({ title, description }: ContentSectionHeaderProps) {
  return (
    <div className="mb-6 md:mb-7">
      <h2 className="mb-2 font-['NEXON_Football_Gothic'] text-[clamp(24px,4vw,34px)] font-bold leading-tight text-black">
        {title}
      </h2>
      <p className="font-['Noto_Sans_KR'] text-[clamp(13px,1.8vw,15px)] text-[#6b6b6b]">{description}</p>
    </div>
  );
}

