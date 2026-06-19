import { ArrowRight } from "lucide-react";
import imgShutterstock17810092852 from "figma:asset/15fabd854b7cb3b15474b1d58ae3661dd03a76db.png";
import imgRectangle117 from "figma:asset/d172ff08cd7214d515abeaf0da2f756d82f17607.png";
import imgRectangle132 from "figma:asset/f65089cc3d077a6b33562597ca4ec5703b3e9ae7.png";

export function MainBanner({ onClick }: { onClick?: () => void }) {
  return (
    <button
      aria-label="나의 페르소나 진단하기"
      className="group relative h-[clamp(190px,33vh,390px)] w-full overflow-hidden rounded-[22px] border border-white/50 shadow-[0_12px_30px_rgba(15,23,42,0.14)] transition-all duration-500 hover:shadow-[0_18px_40px_rgba(15,23,42,0.2)] md:h-[clamp(240px,36vh,460px)] md:rounded-[26px]"
      onClick={onClick}
    >
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:rotate-[-0.8deg] group-hover:scale-[1.02]">
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_28%] transition-transform duration-700 ease-out group-hover:scale-[1.1]"
          src={imgShutterstock17810092852}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/58 via-black/76 to-black/90" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-8 top-5 h-[160px] w-[160px] bg-white/4 blur-xl" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[26px] border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-[1px]" />

        <div className="absolute bottom-4 left-4 max-w-[76%] text-left text-white md:bottom-6 md:left-6 xl:bottom-8 xl:left-8">
        <p className="font-body mb-1 text-[11px] font-semibold tracking-[0.14em] text-white/90 md:text-[12px] [text-shadow:0_2px_8px_rgba(0,0,0,0.5)]">
          PERSONA DIAGNOSIS
        </p>
        <p className="font-brand text-[clamp(25px,3vw,37px)] font-bold leading-[1.12] tracking-[0.015em] [text-shadow:0_3px_14px_rgba(0,0,0,0.55)]">
          나의 페르소나
          <br />
          진단하기
        </p>
      </div>

      <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-black/25 shadow-[0_8px_16px_rgba(0,0,0,0.24)] backdrop-blur-[7px] transition-all duration-300 group-hover:scale-105 group-hover:bg-black/35 md:h-11 md:w-11">
          <ArrowRight className="h-5 w-5 text-white md:h-6 md:w-6" strokeWidth={2.2} />
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
        aria-label="나의 페르소나"
        className="group relative h-[clamp(108px,18vh,210px)] w-full flex-shrink-0 cursor-pointer overflow-hidden rounded-[18px] border border-white/48 shadow-[0_10px_24px_rgba(15,23,42,0.14)] transition-all duration-500 hover:shadow-[0_16px_32px_rgba(15,23,42,0.2)] [perspective:900px] md:rounded-[20px]"
        onClick={onPersonaClick}
      >
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:rotate-[-0.8deg] group-hover:scale-[1.02]">
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_36%] transition-transform duration-700 ease-out group-hover:scale-[1.1]"
            src={imgRectangle117}
          />
          <div className="absolute inset-0 bg-black/24" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/68 to-black/84" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-8 top-4 h-[110px] w-[110px] bg-white/4 blur-xl" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-[20px] border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-[1px]" />

        <div className="absolute bottom-3 left-3 text-left text-white md:bottom-4 md:left-4">
          <p className="font-brand text-[clamp(16px,1.65vw,23px)] font-bold leading-[1.24] tracking-[0.012em] [text-shadow:0_3px_10px_rgba(0,0,0,0.5)]">
            나의
            <br />
            페르소나
          </p>
        </div>

        <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-black/25 shadow-[0_8px_16px_rgba(0,0,0,0.24)] backdrop-blur-[7px] transition-all duration-300 group-hover:scale-105 group-hover:bg-black/35 md:h-11 md:w-11">
            <ArrowRight className="h-5 w-5 text-white md:h-6 md:w-6" strokeWidth={2.2} />
          </div>
        </div>
      </button>

      <button
        className="group relative h-[clamp(108px,18vh,210px)] w-full cursor-pointer overflow-hidden rounded-[18px] border border-white/48 shadow-[0_10px_24px_rgba(15,23,42,0.14)] transition-all duration-500 hover:shadow-[0_16px_32px_rgba(15,23,42,0.2)] [perspective:900px] md:rounded-[20px]"
        onClick={onContentClick}
      >
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:rotate-[-0.8deg] group-hover:scale-[1.02]">
          <img
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.1]"
            src={imgRectangle132}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/58 via-black/76 to-black/90" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-8 top-4 h-[110px] w-[110px] bg-white/4 blur-xl" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-[20px] border border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-[1px]" />

        <div className="absolute bottom-3 left-3 text-left text-white md:bottom-4 md:left-4">
          <p className="font-brand text-[clamp(16px,1.65vw,23px)] font-bold leading-[1.24] tracking-[0.012em] [text-shadow:0_3px_10px_rgba(0,0,0,0.5)]">
            콘텐츠
            <br />
            바로 만들기
          </p>
        </div>
        <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-black/25 shadow-[0_8px_16px_rgba(0,0,0,0.24)] backdrop-blur-[7px] transition-all duration-300 group-hover:scale-105 group-hover:bg-black/35 md:h-11 md:w-11">
            <ArrowRight className="h-5 w-5 text-white md:h-6 md:w-6" strokeWidth={2.2} />
          </div>
        </div>
      </button>
    </div>
  );
}
