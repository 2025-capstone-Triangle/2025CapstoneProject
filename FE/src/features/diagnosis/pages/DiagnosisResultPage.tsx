import { useMemo, useState } from "react";
import {
  ChevronDown,
  Copy,
  Download,
  Edit2,
  Heart,
  Lock,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { isAuthenticated } from "../../../lib/auth";
import { BackButton } from "../../../shared/layout/BackButton";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";
import { raiseErrorToast } from "../../../lib/errorToastService";
import { type PersonaResponse } from "../../persona/lib/personaApi";
import { setPendingPersonaCode } from "../../persona/lib/personaShareCode";

interface DiagnosisResultPageProps {
  result?: PersonaResponse | null;
  mode?: "diagnosis" | "view";
  onSave?: (payload: { code: string; name: string }) => Promise<void> | void;
  onRecreate?: () => void;
  onBack?: () => void;
  onHome?: () => void;
  onNavigateToSignup?: () => void;
  onNavigateToLogin?: () => void;
  viewLeftActionLabel?: string;
  viewLeftAction?: () => void;
  viewRightActionLabel?: string;
  viewRightAction?: () => void;
  statusBadgeLabel?: string;
  onEditName?: () => void;
}

function ensureHex(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

export function DiagnosisResultPage({
  result,
  mode = "diagnosis",
  onSave,
  onRecreate,
  onBack,
  onHome,
  onNavigateToSignup,
  onNavigateToLogin,
  viewLeftActionLabel = "목록으로",
  viewLeftAction,
  viewRightActionLabel = "콘텐츠 만들기",
  viewRightAction,
  statusBadgeLabel,
  onEditName,
}: DiagnosisResultPageProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showGuestCodeModal, setShowGuestCodeModal] = useState(false);
  const [guestPersonaCode, setGuestPersonaCode] = useState("");
  const [copyDone, setCopyDone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const keywords = useMemo(() => {
    return (result?.keywords ?? []).slice(0, 3);
  }, [result]);

  const colors = useMemo(() => {
    const fromResult = (result?.colors ?? []).map(ensureHex).filter((value): value is string => Boolean(value));
    return fromResult;
  }, [result]);

  const personaName = result?.name || "";
  const personaCode = result?.code || "";
  const personaDescription = useMemo(() => {
    const summary = result?.summary?.trim();
    if (summary) return summary;
    return "설명 데이터가 없습니다.";
  }, [result]);

  const selectedImage = result?.thumbnail || result?.profile || "";
  const traitsDetail = result?.traits?.trim() || "";

  const getImageExtension = (url: string) => {
    try {
      const parsed = new URL(url);
      const fileName = parsed.pathname.split("/").pop() ?? "";
      const matched = fileName.match(/\.(png|jpe?g|webp)$/i);
      return matched?.[1]?.toLowerCase() ?? "png";
    } catch {
      const fileName = url.split("?")[0]?.split("/").pop() ?? "";
      const matched = fileName.match(/\.(png|jpe?g|webp)$/i);
      return matched?.[1]?.toLowerCase() ?? "png";
    }
  };

  const handleDownloadThumbnail = async () => {
    if (!selectedImage) {
      raiseErrorToast("저장할 이미지가 없습니다.");
      return;
    }

    const extension = getImageExtension(selectedImage);
    const safeName =
      personaName.trim().replace(/[^\w가-힣]+/g, "-").replace(/^-+|-+$/g, "") || "persona";
    const fileName = `${safeName}-thumbnail.${extension === "jpeg" ? "jpg" : extension}`;

    try {
      const response = await fetch(selectedImage);
      if (!response.ok) throw new Error("fetch failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(blobUrl);
      raiseErrorToast("이미지를 저장했습니다.");
      return;
    } catch {
      raiseErrorToast("이미지 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  if (!result) {
    return (
      <div className="bg-white h-full min-h-0 diag-page-root w-full max-w-[980px] mx-auto">
        <DefaultTopBar onTitleClick={onHome} showNotification={false} />
        <BackButton onClick={onBack} />
        <div className="mx-auto max-w-[760px] px-5 sm:px-8 lg:px-10 pt-10">
          <div className="rounded-[16px] border border-[#f0d0d0] bg-[#fff7f7] p-5">
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#bb3b3b] mb-3">
              진단 결과 데이터를 불러오지 못했습니다. 입력값을 확인한 뒤 다시 진단해 주세요.
            </p>
            <button
              onClick={onRecreate}
              className="h-[40px] px-4 rounded-[10px] bg-black text-white text-[13px] font-['Noto_Sans_KR']"
            >
              다시 진단하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveClick = async () => {
    setSaveError("");

    if (!personaCode) {
      setSaveError("진단 코드가 없어 저장할 수 없습니다. 다시 진단해 주세요.");
      return;
    }

    if (isAuthenticated()) {
      setIsSaving(true);
      try {
        await onSave?.({ code: personaCode, name: personaName });
      } catch (error) {
        const message = error instanceof Error ? error.message : "저장에 실패했습니다.";
        setSaveError(message);
      } finally {
        setIsSaving(false);
      }
      return;
    }

    setGuestPersonaCode(personaCode);
    setCopyDone(false);
    setShowGuestCodeModal(true);
  };

  const handleCopyCode = async () => {
    if (!guestPersonaCode) return;

    try {
      await navigator.clipboard.writeText(guestPersonaCode);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 1400);
      return;
    } catch {
      const tempTextArea = document.createElement("textarea");
      tempTextArea.value = guestPersonaCode;
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand("copy");
      document.body.removeChild(tempTextArea);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 1400);
    }
  };

  const handleMoveToSignup = () => {
    if (guestPersonaCode) {
      setPendingPersonaCode(guestPersonaCode);
    }
    setShowGuestCodeModal(false);
    onNavigateToSignup?.();
  };

  const handleMoveToLogin = () => {
    if (guestPersonaCode) {
      setPendingPersonaCode(guestPersonaCode);
    }
    setShowGuestCodeModal(false);
    onNavigateToLogin?.();
  };

  return (
    <div className="bg-gradient-to-b from-[#fafafa] to-white h-full min-h-0 diag-page-root w-full max-w-[980px] mx-auto">
      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />

      <div className="relative mx-auto max-w-[760px] px-5 sm:px-8 lg:px-10 pt-8 pb-8">
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#EF466F] to-[#ff6b8a] text-white px-5 py-2 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4" />
            <span className="font-['Noto_Sans_KR'] font-semibold text-[13px]">
              {statusBadgeLabel ?? (mode === "view" ? "저장된 페르소나" : "페르소나 생성 완료")}
            </span>
          </div>
        </div>

        <div className="relative mb-6">
          <div className="w-full aspect-[4/5] bg-gradient-to-br from-[#2d2d2d] via-[#3d3d3d] to-[#1d1d1d] rounded-[24px] overflow-hidden shadow-2xl border-4 border-white">
            {selectedImage ? <img src={selectedImage} alt={personaName} className="h-full w-full object-cover" /> : null}
          </div>

          <button
            onClick={() => setLiked(!liked)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Heart className={`w-6 h-6 transition-all ${liked ? "fill-[#EF466F] text-[#EF466F]" : "text-black"}`} />
          </button>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleDownloadThumbnail}
            disabled={!selectedImage}
            className="inline-flex items-center gap-2 rounded-[12px] border border-[#e5e5e5] bg-white px-4 py-2 font-['Noto_Sans_KR'] text-[13px] text-black shadow-sm hover:bg-[#f7f7f7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            이미지 저장
          </button>
        </div>
      </div>

      <div className="bg-white rounded-t-[32px] mx-auto max-w-[760px] px-5 sm:px-8 lg:px-10 pt-8 pb-24 md:pb-10 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="font-['NEXON_Football_Gothic'] text-[22px] text-black">{personaName}</h2>
            {mode === "view" && onEditName ? (
              <button
                type="button"
                onClick={onEditName}
                className="inline-flex items-center justify-center w-8 h-8 rounded-[10px] border border-[#ececec] bg-white text-[#444] hover:border-black hover:text-black transition-colors"
                aria-label="페르소나 이름 수정"
                title="이름 수정"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            ) : null}
          </div>
          {keywords.length > 0 ? (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {keywords.map((keyword) => (
                <span key={keyword} className="bg-gradient-to-r from-[#f8f8f8] to-[#f0f0f0] px-4 py-2 rounded-full font-['NEXON_Football_Gothic'] text-[16px] text-black border border-[#e5e5e5]">
                  #{keyword}
                </span>
              ))}
            </div>
          ) : (
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666] mb-4">키워드 데이터가 없습니다.</p>
          )}
        </div>

        <div className="mb-8">
          <h3 className="font-['Noto_Sans_KR'] font-semibold text-[15px] text-black mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-black rounded-full" />
            컬러 팔레트
          </h3>
          {colors.length > 0 ? (
            <div className="rounded-[16px] border border-[#ececec] bg-gradient-to-r from-[#fcfcfc] to-[#f7f7f7] p-3">
              <div className="flex items-center gap-3 overflow-x-auto">
              {colors.map((color, index) => (
                <button
                  key={`${color}-${index}`}
                  type="button"
                  title={`${color.toUpperCase()} 복사`}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(color.toUpperCase());
                      raiseErrorToast("색상 코드가 복사되었습니다.");
                    } catch {
                      raiseErrorToast("색상 코드를 복사할 수 없습니다.");
                    }
                  }}
                  className="group relative shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-full border border-transparent shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] hover:border-black/40 focus-visible:border-black focus-visible:outline-none transition-colors"
                  style={{ backgroundColor: color }}
                >
                  <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[10px] border border-white/15 bg-black/90 backdrop-blur px-2.5 py-1.5 font-['Noto_Sans_KR'] text-[11px] text-white opacity-0 shadow-[0_8px_20px_rgba(0,0,0,0.24)] transition-all duration-150 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0">
                    {color.toUpperCase()}
                  </span>
                </button>
              ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#fafafa] rounded-[16px] p-5 border border-[#ececec]">
              <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">컬러 데이터가 없습니다.</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h3 className="font-['Noto_Sans_KR'] font-semibold text-[15px] text-black mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-black rounded-full" />
            페르소나 설명
          </h3>
          <div className="bg-gradient-to-br from-[#fafafa] to-[#f5f5f5] rounded-[16px] p-5 border border-[#e5e5e5]">
            <p className="font-['Noto_Sans_KR'] text-[14px] text-[#262626] leading-[1.8]">{personaDescription}</p>
          </div>
        </div>

        <div className="mb-8">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between py-4 px-5 border-2 border-[#f0f0f0] rounded-[16px] hover:border-[#e5e5e5] transition-colors"
          >
            <span className="font-['Noto_Sans_KR'] font-semibold text-[14px] text-black">상세 정보 및 활용</span>
            <ChevronDown className={`w-5 h-5 text-[#6b6b6b] transition-transform ${showDetails ? "rotate-180" : ""}`} />
          </button>
          {showDetails && (
            <div className="bg-gradient-to-br from-[#f8f8f8] to-[#f0f0f0] rounded-[16px] p-5 mt-3 border border-[#e5e5e5]">
              <p className="font-['Noto_Sans_KR'] text-[14px] text-[#262626] leading-[1.8]">
                {traitsDetail || "세부 특성 정보가 없습니다."}
              </p>
            </div>
          )}
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#f0f0f0] w-full max-w-[980px] mx-auto md:static md:border-t-0 md:bg-transparent md:backdrop-blur-0">
        <div className="mx-auto max-w-[760px] p-4 sm:p-6 lg:px-10 md:pt-2 md:pb-8">
          {mode === "diagnosis" ? (
            <>
              {saveError ? <p className="mb-2 font-['Noto_Sans_KR'] text-[12px] text-[#d92d20]">{saveError}</p> : null}
              <div className="flex gap-3">
                <button
                  onClick={onRecreate}
                  className="flex-1 bg-white border-2 border-[#e5e5e5] rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-black flex items-center justify-center gap-2 hover:border-black hover:bg-[#fafafa] transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                  다시 만들기
                </button>
                <button
                  onClick={handleSaveClick}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-black to-[#2d2d2d] rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
                >
                  {isSaving ? "저장 중" : "저장하기"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={viewLeftAction ?? onBack}
                className="flex-1 bg-white border-2 border-[#e5e5e5] rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-black flex items-center justify-center hover:border-black hover:bg-[#fafafa] transition-all"
              >
                {viewLeftActionLabel}
              </button>
              <button
                onClick={viewRightAction}
                className="flex-1 bg-gradient-to-r from-black to-[#2d2d2d] rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
              >
                {viewRightActionLabel}
              </button>
            </div>
          )}
        </div>
      </div>

      {mode === "diagnosis" && showGuestCodeModal ? (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-end justify-center p-5" onClick={() => setShowGuestCodeModal(false)}>
          <div className="w-full max-w-[360px] rounded-[24px] bg-white p-6 shadow-2xl border border-[#ececec]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#fff3f5] flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#EF466F]" />
              </div>
              <p className="font-['NEXON_Football_Gothic'] text-[18px] text-black">로그인 후 저장 가능</p>
            </div>
            <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666] leading-[1.6] mb-4">
              지금은 계정이 없어 저장할 수 없어요. 대신 아래 페르소나 코드를 복사해 두면, 가입 후 <span className="font-semibold text-black">내 페르소나</span>에서 바로 가져올 수 있습니다.
            </p>

            <div className="rounded-[14px] border border-[#e5e5e5] bg-[#fafafa] px-4 py-3 flex items-center justify-between gap-2 mb-2">
              <span className="font-['NEXON_Football_Gothic'] text-[18px] tracking-[0.08em] text-black">{guestPersonaCode}</span>
              <button onClick={handleCopyCode} className="h-9 px-3 rounded-[10px] bg-black text-white text-[12px] font-['Noto_Sans_KR'] flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5" />
                {copyDone ? "복사됨" : "복사"}
              </button>
            </div>
            <p className="font-['Noto_Sans_KR'] text-[12px] text-[#8a8a8a] mb-5">코드 형식: PRS-XXXX-XXXX</p>

            <div className="space-y-2.5">
              <button onClick={handleMoveToSignup} className="w-full h-[48px] rounded-[14px] bg-black text-white font-['Noto_Sans_KR'] font-semibold text-[14px]">
                회원가입 후 코드 입력하기
              </button>
              <button onClick={handleMoveToLogin} className="w-full h-[48px] rounded-[14px] border border-[#e5e5e5] bg-white text-black font-['Noto_Sans_KR'] font-semibold text-[14px]">
                로그인하러 가기
              </button>
              <button onClick={() => setShowGuestCodeModal(false)} className="w-full h-[44px] rounded-[12px] bg-[#f7f7f7] text-[#555] font-['Noto_Sans_KR'] text-[13px]">
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


