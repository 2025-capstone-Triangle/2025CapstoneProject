import { ChevronRight } from "lucide-react";
import imgShutterstock17810092852 from "figma:asset/15fabd854b7cb3b15474b1d58ae3661dd03a76db.png";
import imgRectangle117 from "figma:asset/d172ff08cd7214d515abeaf0da2f756d82f17607.png";
import imgRectangle132 from "figma:asset/f65089cc3d077a6b33562597ca4ec5703b3e9ae7.png";

export function MainBanner({ onClick }: { onClick?: () => void }) {
  return (
    <button
      className="group relative h-[clamp(136px,22vh,280px)] w-full overflow-hidden rounded-[20px] shadow-[0_16px_42px_rgba(17,17,17,0.16)] transition-transform duration-500 hover:shadow-[0_24px_58px_rgba(17,17,17,0.22)] md:rounded-[24px]"
      onClick={onClick}
    >
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:rotate-[-0.8deg] group-hover:scale-[1.02]">
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.1]"
          src={imgShutterstock17810092852}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-black/40 to-black/80" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 top-6 h-[160px] w-[160px] bg-white/10 blur-2xl" />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 rounded-[24px] border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-[3px]"
        style={{
          WebkitMaskImage: "radial-gradient(closest-side, transparent 72%, black 100%)",
          maskImage: "radial-gradient(closest-side, transparent 72%, black 100%)",
        }}
      />

      <div className="absolute bottom-4 right-4 text-right text-white md:bottom-6 md:right-6 xl:bottom-8 xl:right-8">
        <p className="font-['NEXON_Football_Gothic'] text-[clamp(22px,2.9vw,38px)] font-bold leading-[1.15]">진단하고</p>
        <p className="font-['NEXON_Football_Gothic'] text-[clamp(22px,2.9vw,38px)] font-bold leading-[1.15]">나다운 스타일 찾기</p>
      </div>

      <div className="absolute right-4 top-[37%] -translate-y-1/2 md:right-6 xl:right-8">
        <div className="rounded-full border border-white/35 bg-black/25 p-2 shadow-[0_10px_22px_rgba(0,0,0,0.28)] backdrop-blur-[4px] transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-[1.04]">
          <ChevronRight className="h-5 w-5 text-white md:h-7 md:w-7" />
        </div>
      </div>
    </button>
  );
}

export function SubBanners({
  onPersonaClick,
  onContentClick,
}: {
  onPersonaClick?: () => void;
  onContentClick?: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 px-0 md:gap-3 md:px-1 xl:gap-4">
      <button
        className="group relative h-[clamp(112px,18vh,220px)] w-full flex-shrink-0 cursor-pointer overflow-hidden rounded-[16px] shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition-all duration-500 hover:shadow-[0_18px_38px_rgba(0,0,0,0.22)] [perspective:900px] md:rounded-[20px]"
        onClick={onPersonaClick}
      >
        <div className="absolute inset-0 transition-transform duration-700 group-hover:rotate-[-1.2deg] group-hover:scale-[1.03]">
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.12]"
            src={imgRectangle117}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/75" />
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-[20px] border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" />

        <div className="absolute bottom-3 left-3 text-left leading-[1.2] text-white md:bottom-4 md:left-4">
          <p className="font-['NEXON_Football_Gothic'] text-[clamp(15px,1.6vw,22px)] font-bold">내</p>
          <p className="font-['NEXON_Football_Gothic'] text-[clamp(15px,1.6vw,22px)] font-bold">페르소나</p>
        </div>
        <div className="absolute bottom-3 right-3 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:scale-[1.04] md:bottom-4 md:right-4">
          <ChevronRight className="h-4 w-4 text-white md:h-5 md:w-5" />
        </div>
      </button>

      <button
        className="group relative h-[clamp(112px,18vh,220px)] w-full cursor-pointer overflow-hidden rounded-[16px] shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition-all duration-500 hover:shadow-[0_20px_42px_rgba(0,0,0,0.22)] [perspective:900px] md:rounded-[20px]"
        onClick={onContentClick}
      >
        <div className="absolute inset-0 transition-transform duration-700 group-hover:rotate-[1deg] group-hover:scale-[1.03]">
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.1]"
            src={imgRectangle132}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/75" />
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-[20px] border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" />

        <div className="absolute bottom-3 left-3 text-left leading-[1.2] text-white md:bottom-4 md:left-4">
          <p className="font-['NEXON_Football_Gothic'] text-[clamp(16px,1.6vw,22px)] font-bold">콘텐츠</p>
          <p className="font-['NEXON_Football_Gothic'] text-[clamp(16px,1.6vw,22px)] font-bold">바로 만들기</p>
        </div>
        <div className="absolute bottom-3 right-3 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:scale-[1.04] md:bottom-4 md:right-4">
          <ChevronRight className="h-5 w-5 text-white md:h-6 md:w-6" />
        </div>
      </button>
    </div>
  );
}
