import { useMemo, useState } from "react";
import { isAuthenticated } from "../../../lib/auth";
import { raiseErrorToast } from "../../../lib/errorToastService";
import { setPendingPersonaCode, setPendingPersonaIsSelf } from "../../persona/lib/personaShareCode";
import type { PersonaResponse } from "../../persona/lib/personaApi";

interface UseDiagnosisResultParams {
  result?: PersonaResponse | null;
  onSave?: (payload: { code: string; name: string }) => Promise<void> | void;
  onNavigateToSignup?: () => void;
  onNavigateToLogin?: () => void;
}

function ensureHex(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function getImageExtension(url: string) {
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
}

export function useDiagnosisResult({
  result,
  onSave,
  onNavigateToSignup,
  onNavigateToLogin,
}: UseDiagnosisResultParams) {
  const [showDetails, setShowDetails] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showGuestCodeModal, setShowGuestCodeModal] = useState(false);
  const [guestPersonaCode, setGuestPersonaCode] = useState("");
  const [copyDone, setCopyDone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const keywords = useMemo(() => (result?.keywords ?? []).slice(0, 3), [result]);
  const colors = useMemo(
    () => (result?.colors ?? []).map(ensureHex).filter((value): value is string => Boolean(value)),
    [result],
  );

  const personaName = result?.name || "";
  const personaCode = result?.code || "";
  const personaDescription = useMemo(() => {
    const summary = result?.summary?.trim();
    if (summary) return summary;
    return "설명 데이터가 없습니다.";
  }, [result]);
  const selectedImage = result?.thumbnail || result?.profile || "";
  const traitsDetail = result?.traits?.trim() || "";

  const handleDownloadThumbnail = async () => {
    if (!selectedImage) {
      raiseErrorToast("다운로드할 이미지가 없습니다.");
      return;
    }

    const extension = getImageExtension(selectedImage);
    const safeName =
      personaName.trim().replace(/[^\w가-힣]+/g, "-").replace(/^-+|-+$/g, "") || "persona";
    const fileName = `${safeName}-thumbnail.${extension === "jpeg" ? "jpg" : extension}`;

    try {
      const response = await fetch(selectedImage, { mode: "cors" });
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
    } catch {
      // CORS 제한으로 직접 다운로드 불가 — 새 탭에서 열어 저장 유도
      window.open(selectedImage, "_blank", "noopener,noreferrer");
      raiseErrorToast("이미지를 새 탭에서 열었습니다. 길게 눌러 저장해 주세요.");
    }
  };

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
      setPendingPersonaIsSelf(true);
    }
    setShowGuestCodeModal(false);
    onNavigateToSignup?.();
  };

  const handleMoveToLogin = () => {
    if (guestPersonaCode) {
      setPendingPersonaCode(guestPersonaCode);
      setPendingPersonaIsSelf(true);
    }
    setShowGuestCodeModal(false);
    onNavigateToLogin?.();
  };

  const handleCopyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color.toUpperCase());
      raiseErrorToast("색상 코드가 복사되었습니다.");
    } catch {
      raiseErrorToast("색상 코드를 복사할 수 없습니다.");
    }
  };

  return {
    keywords,
    colors,
    personaName,
    personaDescription,
    selectedImage,
    traitsDetail,
    liked,
    showDetails,
    isSaving,
    saveError,
    showGuestCodeModal,
    guestPersonaCode,
    copyDone,
    setShowGuestCodeModal,
    toggleLiked: () => setLiked((prev) => !prev),
    toggleDetails: () => setShowDetails((prev) => !prev),
    handleDownloadThumbnail,
    handleSaveClick,
    handleCopyCode,
    handleMoveToSignup,
    handleMoveToLogin,
    handleCopyColor,
  };
}
