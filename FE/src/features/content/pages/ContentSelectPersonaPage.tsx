import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { getPersonaList, type PersonaResponse } from "../../persona/lib/personaApi";
import { ContentBottomActionBar } from "../components/ContentBottomActionBar";
import { ContentPageLayout } from "../components/ContentPageLayout";
import { ContentSectionHeader } from "../components/ContentSectionHeader";
import { PersonaOptionCard } from "../components/PersonaOptionCard";

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
      colors: persona.colors?.length
        ? persona.colors.slice(0, 5)
        : ["#000000", "#444444", "#777777", "#aaaaaa", "#dddddd"],
      profile: persona.profile || persona.thumbnail || "",
    }));
  }, [personas]);

  return (
    <ContentPageLayout
      onBack={onBack}
      onHome={onHome}
      contentMaxWidthClassName="max-w-[980px]"
      contentClassName="px-4 pb-28 pt-2 sm:px-8 md:px-10 md:pb-8"
      bottomMaxWidthClassName="max-w-[980px]"
      bottom={
        <ContentBottomActionBar
          label="다음"
          onClick={() => selectedPersona && onNext?.(selectedPersona)}
          disabled={!selectedPersona || loading || Boolean(error)}
        />
      }
    >
      <ContentSectionHeader title="페르소나 선택" description="콘텐츠에 사용할 페르소나를 선택해 주세요." />

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
        <div className="mb-6 grid gap-3 xl:grid-cols-2">
          {mapped.map((persona) => (
            <PersonaOptionCard
              key={persona.code}
              persona={persona}
              selected={selectedPersona === persona.code}
              onSelect={setSelectedPersona}
            />
          ))}
        </div>
      ) : null}
    </ContentPageLayout>
  );
}
