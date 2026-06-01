import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";
import { DiagnosisResultPage } from "../../diagnosis/pages/DiagnosisResultPage";
import {
  getPersonaList,
  removePersona,
  renamePersona,
  type PersonaResponse,
} from "../lib/personaApi";

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

export function PersonaDetailPage(props: PersonaDetailPageProps) {
  const { personaCode, onCreateContent, onBack, onHome, onDelete, onViewAllContents } = props;
  const [persona, setPersona] = useState<PersonaResponse | null>(null);
  const [loadingPersona, setLoadingPersona] = useState(true);
  const [personaError, setPersonaError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [editError, setEditError] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        setNameDraft(item.name);
      }
    } catch (error) {
      setPersonaError(getErrorMessage(error, "페르소나를 불러오지 못했습니다."));
      setPersona(null);
    } finally {
      setLoadingPersona(false);
    }
  };

  useEffect(() => {
    void loadPersona();
  }, [personaCode]);

  const handleRename = async () => {
    if (!persona?.code) return;

    const nextName = nameDraft.trim();
    if (!nextName) {
      setEditError("페르소나 이름을 입력해 주세요.");
      return;
    }

    if (nextName === persona.name) {
      setIsEditOpen(false);
      setEditError("");
      return;
    }

    setEditError("");
    setIsRenaming(true);

    try {
      await renamePersona(persona.code, nextName);
      setPersona((prev) => (prev ? { ...prev, name: nextName } : prev));
      setIsEditOpen(false);
    } catch (error) {
      setEditError(getErrorMessage(error, "이름 변경에 실패했습니다."));
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (!persona?.code) return;

    setEditError("");
    setIsDeleting(true);

    try {
      await removePersona(persona.code);
      setIsEditOpen(false);
      onDelete?.();
    } catch (error) {
      setEditError(getErrorMessage(error, "페르소나 삭제에 실패했습니다."));
    } finally {
      setIsDeleting(false);
    }
  };

  if (loadingPersona) {
    return (
      <div className="persona-page-root persona-pretendard relative bg-white min-h-[100dvh] diag-page-root w-full max-w-[980px] mx-auto overflow-x-hidden">
        <DefaultTopBar onTitleClick={onHome} showNotification={true} leftAction={onBack ? "back" : "none"} onBackClick={onBack} />
        <div className="h-[60vh] flex items-center justify-center gap-2 font-['Noto_Sans_KR'] text-[14px] text-[#666]">
          <Loader2 className="w-4 h-4 animate-spin" />
          페르소나 불러오는 중
        </div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="persona-page-root persona-pretendard relative bg-white min-h-[100dvh] diag-page-root w-full max-w-[980px] mx-auto overflow-x-hidden">
        <DefaultTopBar onTitleClick={onHome} showNotification={true} leftAction={onBack ? "back" : "none"} onBackClick={onBack} />
        <div className="mx-auto max-w-[760px] px-5 sm:px-8 lg:px-10 pt-10">
          <div className="rounded-[16px] border border-[#f0d0d0] bg-[#fff7f7] p-5">
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#bb3b3b] mb-3">
              {personaError || "페르소나를 불러오지 못했습니다."}
            </p>
            <button
              onClick={() => {
                void loadPersona();
              }}
              className="h-[40px] px-4 rounded-[10px] bg-black text-white text-[13px] font-['Noto_Sans_KR'] inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              다시 불러오기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <DiagnosisResultPage
        mode="view"
        result={persona}
        onBack={onBack}
        onHome={onHome}
        viewLeftActionLabel="목록으로"
        viewLeftAction={onBack}
        viewMiddleActionLabel="콘텐츠 리스트"
        viewMiddleAction={onViewAllContents}
        viewRightActionLabel="콘텐츠 만들기"
        viewRightAction={onCreateContent}
        statusBadgeLabel="저장된 페르소나"
        onEditName={() => {
          setNameDraft(persona.name);
          setEditError("");
          setIsEditOpen(true);
        }}
      />

      {isEditOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/45 flex items-end justify-center p-5"
          onClick={() => {
            if (isRenaming || isDeleting) return;
            setIsEditOpen(false);
          }}
        >
          <div
            className="w-full max-w-[380px] rounded-[22px] bg-white p-6 shadow-2xl border border-[#ececec]"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="font-['NEXON_Football_Gothic'] text-[20px] text-black mb-1">페르소나 설정</h3>
            <p className="font-['Noto_Sans_KR'] text-[12px] text-[#666] mb-4">이름 수정 또는 페르소나 삭제</p>

            <input
              value={nameDraft}
              onChange={(event) => {
                setNameDraft(event.target.value);
                setEditError("");
              }}
              placeholder="페르소나 이름"
              className="w-full h-[46px] rounded-[12px] border border-[#d9d9d9] bg-white px-4 font-['Noto_Sans_KR'] text-[13px] text-black placeholder:text-[#999] focus:outline-none focus:border-black"
            />

            {editError ? (
              <p className="mt-2 font-['Noto_Sans_KR'] text-[12px] text-[#d92d20]">{editError}</p>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                disabled={isRenaming || isDeleting}
                className="h-[44px] rounded-[12px] border border-[#e5e5e5] bg-white text-black font-['Noto_Sans_KR'] text-[13px] disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => void handleRename()}
                disabled={isRenaming || isDeleting}
                className="h-[44px] rounded-[12px] bg-black text-white font-['Noto_Sans_KR'] text-[13px] font-semibold disabled:opacity-50"
              >
                {isRenaming ? "저장 중" : "이름 저장"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={isRenaming || isDeleting}
              className="mt-3 w-full h-[44px] rounded-[12px] border border-[#f2d7dc] bg-[#fff7f8] text-[#d92d20] font-['Noto_Sans_KR'] text-[13px] font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "삭제 중" : "페르소나 삭제"}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
