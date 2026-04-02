import { useEffect, useMemo, useState, type MouseEvent } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Heart,
  KeyRound,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { isAuthenticated } from "../../../lib/auth";
import { BackButton } from "../../../shared/layout/BackButton";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";
import { ImageWithFallback } from "../../../shared/ui/ImageWithFallback";
import {
  clearPendingPersonaCode,
  getPendingPersonaCode,
  normalizePersonaCode,
} from "../lib/personaShareCode";
import {
  getPersonaList,
  removePersona,
  saveSharedPersona,
  type PersonaResponse,
} from "../lib/personaApi";

interface PersonaListPageProps {
  onPersonaClick?: (id: string) => void;
  onCreateNew?: () => void;
  onTabChange?: (tab: "home" | "persona" | "content") => void;
  onBack?: () => void;
  onHome?: () => void;
}

interface PersonaCardItem {
  code: string;
  name: string;
  description: string;
  colors: string[];
  thumbnail: string;
  isFavorite: boolean;
}

const FAVORITE_STORAGE_KEY = "personaFavoriteCodes";

function readFavoriteCodes() {
  const raw = localStorage.getItem(FAVORITE_STORAGE_KEY);
  if (!raw) return [] as string[];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFavoriteCodes(codes: string[]) {
  localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(codes));
}

function mapPersonaToCard(item: PersonaResponse, favorites: Set<string>): PersonaCardItem {
  return {
    code: item.code,
    name: item.name,
    description: item.keywords?.length ? item.keywords.join(" · ") : "나만의 페르소나",
    colors: item.colors?.length ? item.colors.slice(0, 4) : ["#000000", "#666666", "#999999", "#cccccc"],
    thumbnail: item.thumbnail || item.profile || "",
    isFavorite: favorites.has(item.code),
  };
}

export function PersonaListPage({ onPersonaClick, onCreateNew, onBack, onHome }: PersonaListPageProps) {
  const [personas, setPersonas] = useState<PersonaCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [importCode, setImportCode] = useState("");
  const [importError, setImportError] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const loadPersonas = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const favoriteSet = new Set(readFavoriteCodes());
      const serverPersonas = await getPersonaList();
      setPersonas(serverPersonas.map((item) => mapPersonaToCard(item, favoriteSet)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "페르소나 목록을 불러오지 못했습니다.";
      setLoadError(message);
      setPersonas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersonas();

    const pendingCode = getPendingPersonaCode();
    if (!pendingCode) return;

    setImportCode(pendingCode);
    setIsImportOpen(true);
    setImportMessage("진단에서 받은 코드가 입력되어 있어요. 추가 버튼을 눌러 가져오세요.");
  }, []);

  const sortedPersonas = useMemo(() => {
    return [...personas].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [personas]);

  const toggleFavorite = (code: string, event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();

    setPersonas((prev) => {
      const next = prev.map((persona) =>
        persona.code === code ? { ...persona, isFavorite: !persona.isFavorite } : persona,
      );
      const favoriteCodes = next.filter((item) => item.isFavorite).map((item) => item.code);
      writeFavoriteCodes(favoriteCodes);
      return next;
    });
  };

  const handleAddByCode = async () => {
    setImportError("");
    setImportMessage("");
    setActionError("");

    if (!isAuthenticated()) {
      setImportError("코드로 가져오기는 로그인 후 이용할 수 있어요.");
      return;
    }

    if (!importCode.trim()) {
      setImportError("페르소나 코드를 입력해 주세요.");
      return;
    }

    const code = normalizePersonaCode(importCode);
    if (personas.some((persona) => normalizePersonaCode(persona.code) === code)) {
      setImportError("이미 추가된 페르소나 코드입니다.");
      return;
    }

    setIsImporting(true);

    try {
      await saveSharedPersona(code, "공유 페르소나");
      await loadPersonas();
      setImportCode("");
      setImportMessage("코드 페르소나가 내 목록에 저장되었습니다.");
      const pendingCode = getPendingPersonaCode();
      if (pendingCode && normalizePersonaCode(pendingCode) === code) {
        clearPendingPersonaCode();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "코드 기반 추가에 실패했습니다.";
      setImportError(message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeletePersona = async (code: string, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (!window.confirm("이 페르소나를 삭제할까요?")) return;

    setActionError("");
    setDeletingCode(code);

    try {
      await removePersona(code);
      setPersonas((prev) => {
        const next = prev.filter((item) => item.code !== code);
        const favoriteCodes = next.filter((item) => item.isFavorite).map((item) => item.code);
        writeFavoriteCodes(favoriteCodes);
        return next;
      });
      setImportMessage("페르소나를 삭제했습니다.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "페르소나 삭제에 실패했습니다.";
      setActionError(message);
    } finally {
      setDeletingCode(null);
    }
  };

  const favoriteCount = personas.filter((persona) => persona.isFavorite).length;

  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto pb-[80px]">
      <DefaultTopBar title="My Persona" onTitleClick={onHome} />
      <BackButton onClick={onBack} />

      <div className="px-8 pt-8">
        <div className="mb-7">
          <h2 className="font-['NEXON_Football_Gothic'] font-bold text-[28px] text-black mb-2 leading-tight">
            저장된 페르소나
          </h2>
          <p className="font-['Noto_Sans_KR'] text-[15px] text-[#6b6b6b]">
            총 {personas.length}개의 페르소나 {favoriteCount > 0 && `· 즐겨찾기 ${favoriteCount}개`}
          </p>
        </div>

        <div className="mb-6 rounded-[20px] border border-[#ececec] bg-gradient-to-br from-[#fcfcfc] to-[#f7f7f7] p-5 shadow-[0_6px_20px_rgba(0,0,0,0.03)]">
          <button
            type="button"
            onClick={() => setIsImportOpen((prev) => !prev)}
            className="w-full flex items-start justify-between gap-3 text-left"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fff2f5] flex items-center justify-center flex-shrink-0">
                <KeyRound className="w-5 h-5 text-[#EF466F]" />
              </div>
              <div>
                <h3 className="font-['NEXON_Football_Gothic'] text-[18px] text-black">코드로 페르소나 추가</h3>
                <p className="font-['Noto_Sans_KR'] text-[12px] text-[#666] leading-[1.5]">
                  공유 코드를 입력하면 내 페르소나 목록에 저장됩니다.
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-[#666] mt-2 transition-transform ${isImportOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isImportOpen ? (
            <div className="mt-4">
              <div className="flex gap-2">
                <input
                  value={importCode}
                  onChange={(event) => {
                    setImportCode(event.target.value.toUpperCase());
                    setImportError("");
                  }}
                  placeholder="PRS-XXXX-XXXX"
                  className="flex-1 h-[46px] rounded-[12px] border border-[#d9d9d9] bg-white px-4 font-['Noto_Sans_KR'] text-[13px] text-black placeholder:text-[#999] focus:outline-none focus:border-black"
                />
                <button
                  onClick={handleAddByCode}
                  disabled={isImporting}
                  className="h-[46px] px-4 rounded-[12px] bg-black text-white font-['Noto_Sans_KR'] text-[13px] font-semibold disabled:opacity-60"
                >
                  {isImporting ? "저장중" : "추가"}
                </button>
              </div>

              {importError && (
                <p className="mt-2 font-['Noto_Sans_KR'] text-[12px] text-[#d92d20]">{importError}</p>
              )}
            </div>
          ) : null}

          {importMessage && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#eefaf3] px-3 py-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0f9f53]" />
              <span className="font-['Noto_Sans_KR'] text-[11px] text-[#0f9f53]">{importMessage}</span>
            </div>
          )}
        </div>

        {actionError && (
          <div className="mb-4 rounded-[12px] border border-[#f0d0d0] bg-[#fff7f7] p-3">
            <p className="font-['Noto_Sans_KR'] text-[12px] text-[#bb3b3b]">{actionError}</p>
          </div>
        )}

        {loading && (
          <div className="h-[220px] flex items-center justify-center text-[#666] font-['Noto_Sans_KR'] text-[14px] gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            페르소나 불러오는 중
          </div>
        )}

        {!loading && loadError && (
          <div className="mb-6 rounded-[14px] border border-[#f0d0d0] bg-[#fff7f7] p-4">
            <p className="font-['Noto_Sans_KR'] text-[12px] text-[#bb3b3b] mb-2">{loadError}</p>
            <button
              onClick={loadPersonas}
              className="h-[34px] px-3 rounded-[9px] bg-black text-white text-[12px] font-['Noto_Sans_KR'] inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              다시 시도
            </button>
          </div>
        )}

        {!loading && sortedPersonas.length > 0 && (
          <div className="space-y-3 mb-6">
            {sortedPersonas.map((persona) => (
              <div key={persona.code} className="relative bg-[#f8f8f8] rounded-[16px] transition-all group hover:bg-[#f0f0f0]">
                <button onClick={() => onPersonaClick?.(persona.code)} className="w-full flex items-center gap-4 p-5">
                  {persona.thumbnail ? (
                    <ImageWithFallback
                      src={persona.thumbnail}
                      alt={persona.name}
                      className="w-[70px] h-[70px] rounded-[12px] object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-[70px] h-[70px] bg-gradient-to-br from-[#e0e0e0] to-[#c0c0c0] rounded-[12px] flex-shrink-0" />
                  )}

                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-['NEXON_Football_Gothic'] font-bold text-[18px] text-black mb-1 truncate">
                      {persona.name}
                    </h3>
                    <p className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b] mb-3 truncate">{persona.description}</p>

                    <div className="flex gap-1.5">
                      {persona.colors.map((color, colorIndex) => (
                        <div
                          key={colorIndex}
                          className="w-5 h-5 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div
                    onClick={(event) => toggleFavorite(persona.code, event)}
                    className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                  >
                    <Heart
                      className={`w-5 h-5 ${persona.isFavorite ? "text-red-500 fill-red-500" : "text-[#d0d0d0]"} transition-colors`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={(event) => void handleDeletePersona(persona.code, event)}
                    disabled={deletingCode === persona.code}
                    className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0 text-[#c0c0c0] hover:text-[#d92d20] disabled:opacity-40"
                    title="페르소나 삭제"
                    aria-label="페르소나 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <ChevronRight className="w-5 h-5 text-[#c0c0c0] group-hover:text-black transition-colors flex-shrink-0" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && sortedPersonas.length === 0 && (
          <div className="mb-6 rounded-[16px] border border-[#ececec] bg-[#fafafa] p-6 text-center">
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">저장된 페르소나가 없습니다.</p>
          </div>
        )}

        <button
          onClick={onCreateNew}
          className="w-full border-2 border-dashed border-[#d0d0d0] rounded-[16px] h-[100px] flex items-center justify-center gap-3 hover:border-black hover:bg-[#fafafa] transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center">
            <Plus className="w-5 h-5 text-[#6b6b6b]" strokeWidth={2.5} />
          </div>
          <span className="font-['Noto_Sans_KR'] font-medium text-[14px] text-[#6b6b6b]">새 페르소나 만들기</span>
        </button>
      </div>
    </div>
  );
}
