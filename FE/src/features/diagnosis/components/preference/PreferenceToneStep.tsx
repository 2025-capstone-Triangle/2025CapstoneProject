import { RotateCcw, SlidersHorizontal } from "lucide-react";
import type { CSSProperties } from "react";
import type { PreferenceToneAdjustment } from "../../lib/preferenceTest";

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (next: number) => void;
}

function SliderField({ label, value, onChange }: SliderFieldProps) {
  return (
    <div className="rounded-[14px] border border-[#ececec] bg-white/95 p-3 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-['Noto_Sans_KR'] text-[13px] font-semibold text-black">{label}</p>
        <p className="rounded-full bg-[#f3f4f6] px-2 py-0.5 font-['Noto_Sans_KR'] text-[11px] font-medium text-[#374151]">
          {value}
        </p>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="tone-slider h-2 w-full cursor-pointer appearance-none rounded-full"
        style={{
          background: `linear-gradient(to right, #111827 0%, #111827 ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`,
        }}
        aria-label={label}
      />
    </div>
  );
}

interface PreferenceToneStepProps {
  toneImageSrc: string;
  toneAdjustment: PreferenceToneAdjustment;
  imageFilterStyle: CSSProperties;
  temperatureOverlayStyle: CSSProperties;
  onChangeTone: (key: keyof PreferenceToneAdjustment, value: number) => void;
  onReset: () => void;
}

export function PreferenceToneStep({
  toneImageSrc,
  toneAdjustment,
  imageFilterStyle,
  temperatureOverlayStyle,
  onChangeTone,
  onReset,
}: PreferenceToneStepProps) {
  return (
    <div className="space-y-3.5 lg:grid lg:h-[min(64vh,560px)] lg:grid-cols-2 lg:items-stretch lg:gap-4 lg:space-y-0">
      <div className="relative h-full overflow-hidden rounded-[20px] border border-[#e5e5e5] bg-[#f4f4f4]">
        <div className="relative h-[min(42vh,320px)] sm:h-[min(46vh,360px)] lg:h-full">
          <img src={toneImageSrc} alt="tone-adjust-target" className="h-full w-full object-contain" style={imageFilterStyle} />
          <div className="pointer-events-none absolute inset-0 mix-blend-color" style={temperatureOverlayStyle} />
        </div>
      </div>

      <div className="flex h-full flex-col rounded-[20px] border border-[#e5e7eb] bg-gradient-to-b from-white to-[#fafafa] p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-2.5 py-1">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#111827]" />
            <span className="font-['Noto_Sans_KR'] text-[11px] font-semibold text-[#111827]">색감 조절</span>
          </div>
          <span className="font-['Noto_Sans_KR'] text-[11px] text-[#6b7280]">실시간 반영</span>
        </div>

        <div className="grid flex-1 gap-3 overflow-y-auto md:grid-cols-2 lg:grid-cols-1 lg:pr-1">
          <SliderField label="채도" value={toneAdjustment.saturation} onChange={(next) => onChangeTone("saturation", next)} />
          <SliderField label="명도" value={toneAdjustment.brightness} onChange={(next) => onChangeTone("brightness", next)} />
          <SliderField label="대비" value={toneAdjustment.contrast} onChange={(next) => onChangeTone("contrast", next)} />
          <SliderField label="온도" value={toneAdjustment.temperature} onChange={(next) => onChangeTone("temperature", next)} />
        </div>

        <button
          onClick={onReset}
          className="mt-3 inline-flex h-[42px] w-full items-center justify-center gap-1.5 rounded-[12px] border border-[#e5e7eb] bg-white font-['Noto_Sans_KR'] text-[12px] font-medium text-[#111827] transition-colors hover:bg-[#f7f7f8]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          보정값 초기화
        </button>
      </div>
    </div>
  );
}
