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
    void loadPersonas();
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
    <div className="flex min-h-[100dvh] w-full flex-col bg-white md:h-full md:min-h-0">
      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />

      <div className="page-scroll">
        <div className="mx-auto w-full max-w-[980px] px-4 pb-28 pt-2 sm:px-8 md:px-10 md:pb-8">
          <div className="mb-6 md:mb-7">
            <h2 className="mb-2 font-['NEXON_Football_Gothic'] text-[clamp(24px,4vw,30px)] font-bold leading-tight text-black">
              페르소나 선택
            </h2>
            <p className="font-['Noto_Sans_KR'] text-[clamp(13px,1.8vw,15px)] text-[#6b6b6b]">
              콘텐츠에 사용할 페르소나를 선택해 주세요.
            </p>
          </div>

          {loading ? (
            <div className="flex h-[220px] items-center justify-center gap-2 font-['Noto_Sans_KR'] text-[14px] text-[#666]">
              <Loader2 className="h-4 w-4 animate-spin" />
              불러오는 중
            </div>
          ) : null}

          {!loading && error ? (
            <div className="rounded-[14px] border border-[#f0d0d0] bg-[#fff7f7] p-4">
              <p className="mb-2 font-['Noto_Sans_KR'] text-[12px] text-[#bb3b3b]">{error}</p>
              <button
                onClick={() => void loadPersonas()}
                className="inline-flex h-[34px] items-center gap-1.5 rounded-[9px] bg-black px-3 font-['Noto_Sans_KR'] text-[12px] text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                다시 시도
              </button>
            </div>
          ) : null}

          {!loading && !error && mapped.length === 0 ? (
            <div className="rounded-[14px] border border-[#ececec] bg-[#fafafa] p-5 text-center">
              <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">저장된 페르소나가 없습니다.</p>
            </div>
          ) : null}

          {!loading && !error && mapped.length > 0 ? (
            <div className="mb-6 grid gap-3 lg:grid-cols-2">
              {mapped.map((persona) => (
                <button
                  key={persona.code}
                  onClick={() => setSelectedPersona(persona.code)}
                  className={`w-full rounded-[16px] p-5 flex items-center gap-4 transition-all ${
                    selectedPersona === persona.code ? "bg-black" : "bg-[#f8f8f8] hover:bg-[#f0f0f0]"
                  }`}
                >
                  {persona.profile ? (
                    <img
                      src={persona.profile}
                      alt={persona.name}
                      className="h-[70px] w-[70px] flex-shrink-0 rounded-[12px] object-cover"
                    />
                  ) : (
                    <div className="h-[70px] w-[70px] flex-shrink-0 rounded-[12px] bg-gradient-to-br from-[#e0e0e0] to-[#c0c0c0]" />
                  )}

                  <div className="flex-1 text-left">
                    <h3
                      className={`mb-1 font-['NEXON_Football_Gothic'] text-[18px] font-bold ${
                        selectedPersona === persona.code ? "text-white" : "text-black"
                      }`}
                    >
                      {persona.name}
                    </h3>
                    <p
                      className={`mb-3 font-['Noto_Sans_KR'] text-[13px] ${
                        selectedPersona === persona.code ? "text-white/80" : "text-[#6b6b6b]"
                      }`}
                    >
                      {persona.description}
                    </p>

                    <div className="flex gap-1.5">
                      {persona.colors.map((color, index) => (
                        <div
                          key={index}
                          className={`h-5 w-5 rounded-full shadow-sm ${
                            selectedPersona === persona.code ? "border border-white/30" : "border border-white"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {selectedPersona === persona.code ? (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-md">
                      <Check className="h-5 w-5 text-black" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="h-6 w-6 flex-shrink-0 rounded-full border-2 border-[#c0c0c0]" />
                  )}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#f0f0f0] bg-white/95 backdrop-blur md:static md:border-t-0 md:bg-transparent md:backdrop-blur-0">
        <div className="mx-auto w-full max-w-[980px] px-4 py-4 sm:px-8 md:px-10 md:pb-8 md:pt-3">
          <button
            onClick={() => selectedPersona && onNext?.(selectedPersona)}
            disabled={!selectedPersona || loading || !!error}
            className="flex h-[52px] w-full items-center justify-center rounded-[16px] bg-black font-['Noto_Sans_KR'] text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#1a1a1a] disabled:opacity-50 sm:h-[56px] sm:text-[16px]"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
