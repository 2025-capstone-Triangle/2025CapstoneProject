import { Check } from "lucide-react";

interface PersonaOptionCardProps {
  persona: {
    code: string;
    name: string;
    description: string;
    colors: string[];
    profile: string;
  };
  selected: boolean;
  onSelect: (code: string) => void;
}

export function PersonaOptionCard({ persona, selected, onSelect }: PersonaOptionCardProps) {
  return (
    <button
      onClick={() => onSelect(persona.code)}
      className={`flex w-full items-start gap-3 rounded-[16px] p-4 transition-all sm:items-center sm:gap-4 sm:p-5 ${
        selected ? "bg-black" : "bg-[#f8f8f8] hover:bg-[#f0f0f0]"
      }`}
    >
      {persona.profile ? (
        <img
          src={persona.profile}
          alt={persona.name}
          className="h-[62px] w-[62px] flex-shrink-0 rounded-[12px] object-cover sm:h-[70px] sm:w-[70px]"
        />
      ) : (
        <div className="h-[62px] w-[62px] flex-shrink-0 rounded-[12px] bg-gradient-to-br from-[#e0e0e0] to-[#c0c0c0] sm:h-[70px] sm:w-[70px]" />
      )}

      <div className="min-w-0 flex-1 text-left">
        <h3
          className={`mb-1 truncate font-['NEXON_Football_Gothic'] text-[17px] font-bold sm:text-[18px] ${
            selected ? "text-white" : "text-black"
          }`}
        >
          {persona.name}
        </h3>
        <p
          className={`mb-3 truncate font-['Noto_Sans_KR'] text-[12px] sm:text-[13px] ${
            selected ? "text-white/80" : "text-[#6b6b6b]"
          }`}
        >
          {persona.description}
        </p>

        <div className="flex gap-1.5">
          {persona.colors.map((color, index) => (
            <div
              key={index}
              className={`h-5 w-5 rounded-full shadow-sm ${
                selected ? "border border-white/30" : "border border-white"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {selected ? (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-md">
          <Check className="h-5 w-5 text-black" strokeWidth={3} />
        </div>
      ) : (
        <div className="h-6 w-6 flex-shrink-0 rounded-full border-2 border-[#c0c0c0]" />
      )}
    </button>
  );
}
