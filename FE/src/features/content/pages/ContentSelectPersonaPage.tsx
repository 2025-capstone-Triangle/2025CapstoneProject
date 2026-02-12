import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, RefreshCw } from "lucide-react";
import { BackButton } from "../../../shared/layout/BackButton";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";
import { getPersonaList, type PersonaResponse } from "../../persona/lib/personaApi";

interface ContentSelectPersonaPageProps {
  onNext?: (personaId: string) => void;
  onBack?: () => void;
  onHome?: () => void;
}

export function ContentSelectPersonaPage({ onNext, onBack, onHome }: ContentSelectPersonaPageProps) {
  const [personas, setPersonas] = useState<PersonaResponse[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPersonas = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getPersonaList();
      setPersonas(data);
      if (data.length > 0) {
        setSelectedPersona((prev) => prev || data[0].code);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "페르소나 목록을 불러오지 못했습니다.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersonas();
  }, []);

  const mapped = useMemo(() => {
    return personas.map((persona) => ({
      code: persona.code,
      name: persona.name,
      description: persona.keywords?.length ? persona.keywords.join(" · ") : "나만의 페르소나",
      colors: persona.colors?.length ? persona.colors.slice(0, 4) : ["#000000", "#666666", "#999999", "#cccccc"],
      profile: persona.profile,
    }));
  }, [personas]);

  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto flex flex-col">
      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />

      <div className="flex-1 overflow-y-auto px-8 pt-8 pb-32">
        <div className="mb-8">
          <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[28px] text-black mb-2 leading-tight">
            페르소나 선택
          </h2>
          <p className="font-['Noto_Sans_KR'] text-[15px] text-[#6b6b6b]">콘텐츠에 사용할 페르소나를 선택해 주세요</p>
        </div>

        {loading && (
          <div className="h-[220px] flex items-center justify-center text-[#666] font-['Noto_Sans_KR'] text-[14px] gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            불러오는 중
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[14px] border border-[#f0d0d0] bg-[#fff7f7] p-4">
            <p className="font-['Noto_Sans_KR'] text-[12px] text-[#bb3b3b] mb-2">{error}</p>
            <button
              onClick={loadPersonas}
              className="h-[34px] px-3 rounded-[9px] bg-black text-white text-[12px] font-['Noto_Sans_KR'] inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              다시 시도
            </button>
          </div>
        )}

        {!loading && !error && mapped.length === 0 && (
          <div className="rounded-[14px] border border-[#ececec] bg-[#fafafa] p-5 text-center">
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">저장된 페르소나가 없습니다.</p>
          </div>
        )}

        {!loading && !error && mapped.length > 0 && (
          <div className="space-y-3 mb-6">
            {mapped.map((persona) => (
              <button
                key={persona.code}
                onClick={() => setSelectedPersona(persona.code)}
                className={`w-full rounded-[16px] p-5 flex items-center gap-4 transition-all ${
                  selectedPersona === persona.code ? "bg-black" : "bg-[#f8f8f8] hover:bg-[#f0f0f0]"
                }`}
              >
                {persona.profile ? (
                  <img src={persona.profile} alt={persona.name} className="w-[70px] h-[70px] rounded-[12px] object-cover flex-shrink-0" />
                ) : (
                  <div className="w-[70px] h-[70px] bg-gradient-to-br from-[#e0e0e0] to-[#c0c0c0] rounded-[12px] flex-shrink-0" />
                )}

                <div className="flex-1 text-left">
                  <h3
                    className={`font-['NEXON_Football_Gothic'] font-bold text-[18px] mb-1 ${
                      selectedPersona === persona.code ? "text-white" : "text-black"
                    }`}
                  >
                    {persona.name}
                  </h3>
                  <p
                    className={`font-['Noto_Sans_KR'] text-[13px] mb-3 ${
                      selectedPersona === persona.code ? "text-white/80" : "text-[#6b6b6b]"
                    }`}
                  >
                    {persona.description}
                  </p>

                  <div className="flex gap-1.5">
                    {persona.colors.map((color, index) => (
                      <div
                        key={index}
                        className={`w-5 h-5 rounded-full shadow-sm ${
                          selectedPersona === persona.code ? "border border-white/30" : "border border-white"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {selectedPersona === persona.code ? (
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                    <Check className="w-5 h-5 text-black" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-[#c0c0c0] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#f0f0f0] p-6 max-w-[390px] mx-auto">
        <button
          onClick={() => selectedPersona && onNext?.(selectedPersona)}
          disabled={!selectedPersona || loading || !!error}
          className="w-full bg-black rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-white flex items-center justify-center shadow-sm disabled:opacity-50 hover:bg-[#1a1a1a] transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  );
}
