import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Edit2, Heart, Loader2, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { BackButton } from "../../../shared/layout/BackButton";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";
import { type ContentStatResponse, getContentListByPersonaCode, toggleContentLike } from "../../content/lib/contentApi";
import { mapContentTypeToRatio } from "../../content/lib/contentType";
import { getPersonaList, removePersona, renamePersona, type PersonaResponse } from "../lib/personaApi";

interface PersonaDetailPageProps {
  personaCode?: string;
  onDelete?: () => void;
  onCreateContent?: () => void;
  onBack?: () => void;
  onTabChange?: (tab: "home" | "persona" | "content") => void;
  onHome?: () => void;
  onViewAllContents?: () => void;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function formatDate(dateRaw: string) {
  if (!dateRaw) return "-";
  const date = new Date(dateRaw);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function PersonaDetailPage({
  personaCode,
  onDelete,
  onCreateContent,
  onBack,
  onHome,
  onViewAllContents,
}: PersonaDetailPageProps) {
  const [persona, setPersona] = useState<PersonaResponse | null>(null);
  const [loadingPersona, setLoadingPersona] = useState(true);
  const [personaError, setPersonaError] = useState("");
  const [contents, setContents] = useState<ContentStatResponse[]>([]);
  const [loadingContents, setLoadingContents] = useState(true);
  const [contentsError, setContentsError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadPersona = async () => {
    setLoadingPersona(true);
    setPersonaError("");

    if (!personaCode) {
      setPersona(null);
      setPersonaError("선택된 페르소나 코드가 없습니다.");
      setLoadingPersona(false);
      return;
    }

    try {
      const data = await getPersonaList(personaCode);
      const item = data[0];
      if (!item) {
        setPersona(null);
        setPersonaError("해당 페르소나를 찾을 수 없습니다.");
      } else {
        setPersona(item);
      }
    } catch (error) {
      setPersonaError(getErrorMessage(error, "페르소나를 불러오지 못했습니다."));
      setPersona(null);
    } finally {
      setLoadingPersona(false);
    }
  };

  const loadContents = async () => {
    setLoadingContents(true);
    setContentsError("");

    if (!personaCode) {
      setContents([]);
      setLoadingContents(false);
      return;
    }

    try {
      const data = await getContentListByPersonaCode(personaCode);
      setContents(data);
    } catch (error) {
      setContentsError(getErrorMessage(error, "저장된 콘텐츠를 불러오지 못했습니다."));
      setContents([]);
    } finally {
      setLoadingContents(false);
    }
  };

  useEffect(() => {
    loadPersona();
    loadContents();
  }, [personaCode]);

  const previewContents = useMemo(() => contents.slice(0, 3), [contents]);

  const handleEditNameClick = () => {
    if (!persona) return;
    setEditingName(persona.name);
    setActionError("");
    setShowEditNameModal(true);
  };

  const handleSaveEditedName = async () => {
    if (!persona) return;
    const nextName = editingName.trim();
    if (!nextName) return;

    setActionError("");
    setNameSaving(true);

    try {
      const updatedList = await renamePersona(persona.code, nextName);
      const updated = updatedList.find((item) => item.code === persona.code) ?? updatedList[0];
      if (updated) {
        setPersona(updated);
      } else {
        setPersona((prev) => (prev ? { ...prev, name: nextName } : prev));
      }
      setShowEditNameModal(false);
    } catch (error) {
      setActionError(getErrorMessage(error, "이름 변경에 실패했습니다."));
    } finally {
      setNameSaving(false);
    }
  };

  const handleDeletePersona = async () => {
    if (!persona) return;
    setActionError("");
    setDeleteLoading(true);

    try {
      await removePersona(persona.code);
      setShowDeleteModal(false);
      onDelete?.();
    } catch (error) {
      setActionError(getErrorMessage(error, "페르소나 삭제에 실패했습니다."));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleLike = async (contentId: number) => {
    const target = contents.find((item) => item.id === contentId);
    if (!target) return;

    const nextLike = !target.isLiked;
    setContents((prev) => prev.map((item) => (item.id === contentId ? { ...item, isLiked: nextLike } : item)));

    try {
      await toggleContentLike(contentId, nextLike);
    } catch (error) {
      setContents((prev) => prev.map((item) => (item.id === contentId ? { ...item, isLiked: !nextLike } : item)));
      setActionError(getErrorMessage(error, "북마크 변경에 실패했습니다."));
    }
  };

  if (loadingPersona) {
    return (
      <div className="bg-white min-h-screen max-w-[390px] mx-auto">
        <DefaultTopBar onTitleClick={onHome} showNotification={false} />
        <BackButton onClick={onBack} />
        <div className="h-[60vh] flex items-center justify-center gap-2 font-['Noto_Sans_KR'] text-[14px] text-[#666]">
          <Loader2 className="w-4 h-4 animate-spin" />
          페르소나 불러오는 중
        </div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="bg-white min-h-screen max-w-[390px] mx-auto">
        <DefaultTopBar onTitleClick={onHome} showNotification={false} />
        <BackButton onClick={onBack} />
        <div className="px-8 pt-10">
          <div className="rounded-[16px] border border-[#f0d0d0] bg-[#fff7f7] p-5">
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#bb3b3b]">{personaError || "페르소나를 찾을 수 없습니다."}</p>
            <button
              onClick={loadPersona}
              className="mt-3 h-[36px] px-3 rounded-[10px] bg-black text-white text-[12px] font-['Noto_Sans_KR'] inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#fafafa] to-white min-h-screen max-w-[390px] mx-auto pb-[40px]">
      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />

      <div className="px-8 pt-6">
        <div className="mb-6 flex flex-col items-center">
          {persona.profile ? (
            <img
              src={persona.profile}
              alt={persona.name}
              className="w-[200px] h-[200px] rounded-[24px] object-cover shadow-xl border border-white"
            />
          ) : (
            <div className="w-[200px] h-[200px] rounded-[24px] bg-gradient-to-br from-[#2d2d2d] via-[#3d3d3d] to-[#1d1d1d] shadow-xl" />
          )}

          <div className="mt-5 flex items-center gap-2">
            <h1 className="font-['NEXON_Football_Gothic'] font-bold text-[28px] text-black">{persona.name}</h1>
            <button onClick={handleEditNameClick} className="p-1.5 rounded-[8px] hover:bg-[#f1f1f1] transition-colors">
              <Edit2 className="w-4 h-4 text-[#6b6b6b]" />
            </button>
          </div>
        </div>

        {persona.keywords?.length > 0 && (
          <div className="mb-7 flex flex-wrap gap-2">
            {persona.keywords.map((keyword) => (
              <span
                key={keyword}
                className="bg-[#f3f3f3] border border-[#e5e5e5] rounded-full px-3.5 py-1.5 font-['Noto_Sans_KR'] text-[12px] text-black"
              >
                #{keyword}
              </span>
            ))}
          </div>
        )}

        <div className="mb-7">
          <h3 className="font-['Noto_Sans_KR'] font-semibold text-[14px] text-black mb-3">컬러 팔레트</h3>
          <div className="bg-white border border-[#ececec] rounded-[16px] p-4 flex items-center gap-3">
            {(persona.colors?.length ? persona.colors : ["#000000", "#666666", "#999999", "#cccccc"])
              .slice(0, 5)
              .map((color, index) => (
                <div key={`${color}-${index}`} className="w-10 h-10 rounded-full border border-white shadow-md" style={{ backgroundColor: color }} />
              ))}
          </div>
        </div>

        <div className="mb-7">
          <h3 className="font-['Noto_Sans_KR'] font-semibold text-[14px] text-black mb-3">페르소나 정보</h3>
          <div className="rounded-[16px] border border-[#ececec] bg-white p-4 space-y-2">
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#444]">코드: {persona.code}</p>
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#444]">생성일: {formatDate(persona.createdAt)}</p>
          </div>
        </div>

        <button
          onClick={onCreateContent}
          className="w-full h-[54px] rounded-[16px] bg-black text-white font-['Noto_Sans_KR'] text-[15px] font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-[#1b1b1b] transition-colors mb-7"
        >
          <Sparkles className="w-4.5 h-4.5" />
          이 페르소나로 콘텐츠 만들기
        </button>

        <div className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-['Noto_Sans_KR'] font-semibold text-[14px] text-black">저장된 콘텐츠</h3>
            <span className="font-['Noto_Sans_KR'] text-[12px] text-[#666]">{contents.length}개</span>
          </div>

          {loadingContents && (
            <div className="h-[120px] flex items-center justify-center text-[#666] font-['Noto_Sans_KR'] text-[13px] gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              콘텐츠 불러오는 중
            </div>
          )}

          {!loadingContents && contentsError && (
            <div className="rounded-[12px] border border-[#f0d0d0] bg-[#fff7f7] p-3">
              <p className="font-['Noto_Sans_KR'] text-[12px] text-[#bb3b3b]">{contentsError}</p>
            </div>
          )}

          {!loadingContents && !contentsError && previewContents.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {previewContents.map((item) => (
                  <div key={item.id} className="group">
                    <div className="relative w-full h-[132px] rounded-[14px] overflow-hidden bg-[#ececec]">
                      {item.img ? (
                        <img src={item.img} alt={`content-${item.id}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#d7d7d7] to-[#bbbbbb]" />
                      )}
                      <div className="absolute left-1.5 bottom-1.5 rounded-[7px] bg-white/90 px-2 py-0.5 font-['Noto_Sans_KR'] text-[10px] font-semibold">
                        {mapContentTypeToRatio(item.type)}
                      </div>
                      <button
                        onClick={() => handleToggleLike(item.id)}
                        className="absolute right-1.5 top-1.5 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"
                      >
                        <Heart className={`w-3.5 h-3.5 ${item.isLiked ? "fill-black text-black" : "text-black"}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={onViewAllContents}
                className="w-full h-[42px] rounded-[12px] bg-[#f7f7f7] text-black font-['Noto_Sans_KR'] text-[13px] font-medium flex items-center justify-center gap-1.5 hover:bg-[#efefef] transition-colors"
              >
                전체 콘텐츠 보기
                <ChevronRight className="w-4 h-4 text-[#666]" />
              </button>
            </>
          )}

          {!loadingContents && !contentsError && previewContents.length === 0 && (
            <div className="rounded-[12px] border border-[#ececec] bg-[#fafafa] p-4 text-center font-['Noto_Sans_KR'] text-[12px] text-[#666]">
              아직 저장된 콘텐츠가 없습니다.
            </div>
          )}
        </div>

        {actionError && <p className="mb-4 font-['Noto_Sans_KR'] text-[12px] text-[#d92d20]">{actionError}</p>}

        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full h-[48px] rounded-[12px] border border-[#ffd0d0] bg-[#fff5f5] text-[#EF466F] font-['Noto_Sans_KR'] text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-[#ffeaea] transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          페르소나 삭제
        </button>
      </div>

      {showEditNameModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
          <div className="w-full max-w-[330px] rounded-[20px] bg-white p-6">
            <h3 className="font-['NEXON_Football_Gothic'] text-[20px] text-black mb-4 text-center">페르소나 이름 수정</h3>
            <input
              value={editingName}
              onChange={(event) => setEditingName(event.target.value)}
              className="w-full h-[48px] rounded-[12px] border border-[#ddd] px-4 text-[14px] font-['Noto_Sans_KR'] focus:outline-none focus:border-black"
              placeholder="이름을 입력하세요"
              autoFocus
            />
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setShowEditNameModal(false)}
                className="h-[46px] rounded-[12px] bg-[#f1f1f1] text-black font-['Noto_Sans_KR'] text-[14px] font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleSaveEditedName}
                disabled={nameSaving || !editingName.trim()}
                className="h-[46px] rounded-[12px] bg-black text-white font-['Noto_Sans_KR'] text-[14px] font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-1.5"
              >
                {nameSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
          <div className="w-full max-w-[330px] rounded-[20px] bg-white p-6">
            <h3 className="font-['NEXON_Football_Gothic'] text-[20px] text-black mb-3 text-center">페르소나 삭제</h3>
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666] text-center leading-[1.6] mb-5">
              삭제한 페르소나는 복구할 수 없습니다.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="h-[46px] rounded-[12px] bg-[#f1f1f1] text-black font-['Noto_Sans_KR'] text-[14px] font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleDeletePersona}
                disabled={deleteLoading}
                className="h-[46px] rounded-[12px] bg-[#EF466F] text-white font-['Noto_Sans_KR'] text-[14px] font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-1.5"
              >
                {deleteLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
