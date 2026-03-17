import { useMemo, useState } from "react";
import {
  ChevronDown,
  Copy,
  Heart,
  Lock,
  RefreshCw,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { isAuthenticated } from "../../../lib/auth";
import { BackButton } from "../../../shared/layout/BackButton";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";
import { type PersonaResponse } from "../../persona/lib/personaApi";
import {
  createPersonaShareCode,
  setPendingPersonaCode,
  type ShareablePersona,
} from "../../persona/lib/personaShareCode";

interface DiagnosisResultPageProps {
  result?: PersonaResponse | null;
  onSave?: (payload: { code: string; name: string }) => Promise<void> | void;
  onRecreate?: () => void;
  onBack?: () => void;
  onHome?: () => void;
  onNavigateToSignup?: () => void;
  onNavigateToLogin?: () => void;
}

function randomCodeSegment() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function createSaveCode() {
  return `PRS-${randomCodeSegment()}-${randomCodeSegment()}`;
}

function ensureHex(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

export function DiagnosisResultPage({
  result,
  onSave,
  onRecreate,
  onBack,
  onHome,
  onNavigateToSignup,
  onNavigateToLogin,
}: DiagnosisResultPageProps) {
  const [selectedColor, setSelectedColor] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [liked, setLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGuestCodeModal, setShowGuestCodeModal] = useState(false);
  const [guestPersonaCode, setGuestPersonaCode] = useState("");
  const [copyDone, setCopyDone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const keywords = useMemo(() => {
    if (!result?.keywords?.length) return ["분석 결과", "스타일", "브랜딩"];
    return result.keywords.slice(0, 3);
  }, [result]);

  const colors = useMemo(() => {
    const fromResult = (result?.colors ?? []).map(ensureHex).filter((value): value is string => Boolean(value));
    if (fromResult.length) return fromResult;
    return ["#111111", "#555555", "#999999", "#d1d5db"];
  }, [result]);

  const personaName = result?.name || "페르소나";
  const personaCode = result?.code || "";
  const personaDescription = useMemo(() => {
    if (!keywords.length) return "분석된 페르소나 결과입니다.";
    return `${keywords.join(", ")} 키워드를 중심으로 정리된 사용자 맞춤 페르소나입니다. 콘텐츠 제작 시 이 톤을 유지하면 브랜딩 일관성에 도움이 됩니다.`;
  }, [keywords]);

  const imageCandidates = useMemo(() => {
    const items = [result?.profile, result?.thumbnail].filter((item): item is string => Boolean(item));
    return items.length ? items : [""];
  }, [result]);

  const shareablePersona: ShareablePersona = useMemo(
    () => ({
      name: personaName,
      description: personaDescription,
      colors,
    }),
    [personaName, personaDescription, colors],
  );

  const selectedImage = imageCandidates[currentImageIndex] || imageCandidates[0];

  const handleSaveClick = async () => {
    setSaveError("");

    if (isAuthenticated()) {
      const code = personaCode || guestPersonaCode || createSaveCode();
      setIsSaving(true);
      try {
        await onSave?.({ code, name: personaName });
      } catch (error) {
        const message = error instanceof Error ? error.message : "저장에 실패했습니다.";
        setSaveError(message);
      } finally {
        setIsSaving(false);
      }
      return;
    }

    const code = guestPersonaCode || createPersonaShareCode(shareablePersona);
    setGuestPersonaCode(code);
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
    <div className="bg-gradient-to-b from-[#fafafa] to-white min-h-screen max-w-[390px] mx-auto">
      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />

      <div className="relative px-8 pt-8 pb-8">
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#EF466F] to-[#ff6b8a] text-white px-5 py-2 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4" />
            <span className="font-['Noto_Sans_KR'] font-semibold text-[13px]">페르소나 생성 완료</span>
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

          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {imageCandidates.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-1.5 rounded-full transition-all ${currentImageIndex === index ? "w-8 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-t-[32px] px-8 pt-8 pb-32 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="font-['NEXON_Football_Gothic'] text-[22px] text-black">{personaName}</h2>
          </div>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {keywords.map((keyword) => (
              <span key={keyword} className="bg-gradient-to-r from-[#f8f8f8] to-[#f0f0f0] px-4 py-2 rounded-full font-['NEXON_Football_Gothic'] text-[16px] text-black border border-[#e5e5e5]">
                #{keyword}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-['Noto_Sans_KR'] font-semibold text-[15px] text-black mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-black rounded-full" />
            컬러 팔레트
          </h3>
          <div className="bg-[#fafafa] rounded-[16px] p-5 flex items-center justify-around">
            {colors.map((color, index) => (
              <button
                key={index}
                onClick={() => setSelectedColor(index)}
                className={`rounded-full transition-all shadow-md ${selectedColor === index ? "w-[48px] h-[48px] ring-4 ring-offset-4 ring-black/20" : "w-[40px] h-[40px] hover:scale-110"}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
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
            <span className="font-['Noto_Sans_KR'] font-semibold text-[14px] text-black">상세 정보</span>
            <ChevronDown className={`w-5 h-5 text-[#6b6b6b] transition-transform ${showDetails ? "rotate-180" : ""}`} />
          </button>
          {showDetails && (
            <div className="bg-gradient-to-br from-[#f8f8f8] to-[#f0f0f0] rounded-[16px] p-5 mt-3 border border-[#e5e5e5]">
              <p className="font-['Noto_Sans_KR'] text-[14px] text-[#262626] leading-[1.8]">
                코드: {personaCode || "미발급"}
                <br />
                키워드 개수: {keywords.length}
                <br />
                팔레트 개수: {colors.length}
              </p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Noto_Sans_KR'] font-semibold text-[15px] text-black flex items-center gap-2">
              <div className="w-1 h-5 bg-black rounded-full" />
              추천 프로필
            </h3>
            <button className="p-2 hover:bg-[#f0f0f0] rounded-full transition-colors" onClick={() => setCurrentImageIndex((prev) => (prev + 1) % imageCandidates.length)}>
              <RefreshCw className="w-4 h-4 text-black" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="aspect-square rounded-[16px] overflow-hidden bg-[#f1f1f1] shadow-md">
              {result?.profile ? <img src={result.profile} alt="프로필 1" className="h-full w-full object-cover" /> : null}
            </div>
            <div className="aspect-square rounded-[16px] overflow-hidden bg-[#f1f1f1] shadow-md">
              {result?.thumbnail ? <img src={result.thumbnail} alt="프로필 2" className="h-full w-full object-cover" /> : result?.profile ? <img src={result.profile} alt="프로필 2" className="h-full w-full object-cover" /> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#f0f0f0] p-6 max-w-[390px] mx-auto">
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
      </div>

      {showGuestCodeModal ? (
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
