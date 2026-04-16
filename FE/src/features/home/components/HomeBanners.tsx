import { ArrowRight } from "lucide-react";
import imgShutterstock17810092852 from "figma:asset/15fabd854b7cb3b15474b1d58ae3661dd03a76db.png";
import imgRectangle117 from "figma:asset/d172ff08cd7214d515abeaf0da2f756d82f17607.png";
import imgRectangle132 from "figma:asset/f65089cc3d077a6b33562597ca4ec5703b3e9ae7.png";

export function MainBanner({ onClick }: { onClick?: () => void }) {
  return (
    <button
      aria-label="나의 페르소나 진단하기"
      className="group relative h-[clamp(180px,31vh,360px)] w-full overflow-hidden rounded-[22px] border border-white/45 shadow-[0_16px_42px_rgba(15,23,42,0.16)] transition-all duration-500 hover:shadow-[0_24px_56px_rgba(15,23,42,0.24)] md:h-[clamp(220px,34vh,410px)] md:rounded-[26px]"
      onClick={onClick}
    >
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:rotate-[-0.8deg] group-hover:scale-[1.02]">
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.1]"
          src={imgShutterstock17810092852}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-black/32 to-black/74" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-8 top-5 h-[160px] w-[160px] bg-white/12 blur-2xl" />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 rounded-[26px] border border-white/22 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-[3px]"
        style={{
          WebkitMaskImage: "radial-gradient(closest-side, transparent 72%, black 100%)",
          maskImage: "radial-gradient(closest-side, transparent 72%, black 100%)",
        }}
      />

      <div className="absolute bottom-4 left-4 text-left leading-[1.08] text-white md:bottom-6 md:left-6 xl:bottom-8 xl:left-8">
        <p className="font-brand text-[clamp(24px,3.1vw,40px)] font-bold [text-shadow:0_4px_14px_rgba(0,0,0,0.3)]">
          나의 페르소나 진단하기
        </p>
      </div>

      <div className="absolute right-4 top-[42%] -translate-y-1/2 md:right-6 xl:right-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-black/25 shadow-[0_10px_20px_rgba(0,0,0,0.24)] backdrop-blur-[7px] transition-all duration-300 group-hover:scale-105 group-hover:bg-black/35 md:h-12 md:w-12">
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
        className="group relative h-[clamp(108px,18vh,220px)] w-full flex-shrink-0 cursor-pointer overflow-hidden rounded-[16px] border border-white/38 shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition-all duration-500 hover:shadow-[0_18px_38px_rgba(0,0,0,0.22)] [perspective:900px] md:rounded-[20px]"
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

        <div className="absolute bottom-3 left-3 text-left leading-[1.08] text-white md:bottom-4 md:left-4">
          <p className="font-brand text-[clamp(16px,1.65vw,24px)] font-bold [text-shadow:0_3px_10px_rgba(0,0,0,0.3)]">
            나의 페르소나
          </p>
        </div>

        <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-black/25 shadow-[0_7px_14px_rgba(0,0,0,0.24)] backdrop-blur-[7px] transition-all duration-300 group-hover:scale-105 group-hover:bg-black/35 md:h-9 md:w-9">
            <ArrowRight className="h-4 w-4 text-white md:h-[17px] md:w-[17px]" strokeWidth={2.2} />
          </div>
        </div>
      </button>

      <button
        className="group relative h-[clamp(108px,18vh,220px)] w-full cursor-pointer overflow-hidden rounded-[16px] border border-white/38 shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition-all duration-500 hover:shadow-[0_20px_42px_rgba(0,0,0,0.22)] [perspective:900px] md:rounded-[20px]"
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

        <div className="absolute bottom-3 left-3 text-left leading-[1.08] text-white md:bottom-4 md:left-4">
          <p className="font-brand text-[clamp(16px,1.65vw,24px)] font-bold [text-shadow:0_3px_10px_rgba(0,0,0,0.3)]">
            콘텐츠 바로 만들기
          </p>
        </div>
        <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-black/25 shadow-[0_7px_14px_rgba(0,0,0,0.24)] backdrop-blur-[7px] transition-all duration-300 group-hover:scale-105 group-hover:bg-black/35 md:h-9 md:w-9">
            <ArrowRight className="h-4 w-4 text-white md:h-[17px] md:w-[17px]" strokeWidth={2.2} />
          </div>
        </div>
      </button>
    </div>
  );
}
