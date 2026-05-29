import { useEffect, useRef, useState, type DragEvent } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { checkFaceAnalyzable } from "../lib/faceLandmarkCheck";
import { getStagedDiagnosisImageFiles, stageDiagnosisImageFiles } from "../lib/imageStaging";
import { DiagnosisPageLayout } from "../components/DiagnosisPageLayout";

interface ImageInputPageProps {
  onNext?: () => void;
  onBack?: () => void;
  onHome?: () => void;
}

export function ImageInputPage({ onNext, onBack, onHome }: ImageInputPageProps) {
  const [firstFile, setFirstFile] = useState<File | null>(() => getStagedDiagnosisImageFiles()[0] ?? null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [faceStatus, setFaceStatus] = useState<"idle" | "checking" | "valid" | "invalid" | "error">("idle");
  const [faceMessage, setFaceMessage] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const canProceed = Boolean(uploadedImage) && faceStatus === "valid";

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setFaceStatus("error");
      setFaceMessage("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    setFirstFile(file);
  };

  const openFilePicker = () => {
    firstInputRef.current?.click();
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) return;
    setIsDragOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  useEffect(() => {
    if (!firstFile) return;
    stageDiagnosisImageFiles([firstFile]);
  }, [firstFile]);

  useEffect(() => {
    const preventWindowDrop = (event: globalThis.DragEvent) => {
      event.preventDefault();
    };

    window.addEventListener("dragover", preventWindowDrop);
    window.addEventListener("drop", preventWindowDrop);
    return () => {
      window.removeEventListener("dragover", preventWindowDrop);
      window.removeEventListener("drop", preventWindowDrop);
    };
  }, []);

  useEffect(() => {
    if (!firstFile) {
      setUploadedImage(null);
      return;
    }

    const previewUrl = URL.createObjectURL(firstFile);
    setUploadedImage(previewUrl);
    setFaceStatus("checking");
    setFaceMessage("얼굴 분석 중입니다...");

    let mounted = true;
    checkFaceAnalyzable(firstFile)
      .then((result) => {
        if (!mounted) return;
        setFaceStatus(result.ok ? "valid" : "invalid");
        setFaceMessage(result.reason);
      })
      .catch(() => {
        if (!mounted) return;
        setFaceStatus("error");
        setFaceMessage("얼굴 분석에 실패했습니다.");
      });

    return () => {
      mounted = false;
      URL.revokeObjectURL(previewUrl);
    };
  }, [firstFile]);

  return (
    <DiagnosisPageLayout
      onBack={onBack}
      onHome={onHome}
      contentMaxWidthClassName="max-w-[1120px]"
      contentClassName="px-5 pb-28 pt-3 sm:px-8 sm:pt-4 md:pb-28 lg:px-10"
      bottomMaxWidthClassName="max-w-[1120px]"
      bottom={
        <div className="p-4 sm:p-6 md:px-8 md:pb-8 md:pt-3 lg:px-10">
          <button
            onClick={onNext}
            disabled={!canProceed}
            className="h-[56px] w-full rounded-[16px] bg-black font-['Noto_Sans_KR'] text-[16px] font-semibold text-white transition-colors hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            다음
          </button>
        </div>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
          <div className="rounded-[22px] border border-[#edf1f5] bg-white p-4 shadow-[0_12px_30px_rgba(17,24,39,0.06)] sm:p-5">
            <h2 className="mb-1 text-center font-['Noto_Sans_KR'] text-[16px] font-semibold text-black lg:text-left">
              얼굴이 나온 사진을 올려보세요
            </h2>
            <p className="mb-4 text-center font-['Noto_Sans_KR'] text-[13px] text-[#6b7280] lg:text-left">
              정면에 가까운 선명한 사진일수록 진단 정확도가 높아집니다.
            </p>

            <div className="mb-2">
              <input
                ref={firstInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
              <div
                role="button"
                tabIndex={0}
                onClick={openFilePicker}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openFilePicker();
                  }
                }}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`group relative flex aspect-square min-h-[220px] w-full max-h-[min(48vh,520px)] items-center justify-center overflow-hidden rounded-[16px] bg-gradient-to-br transition-all sm:min-h-[260px] lg:min-h-[300px] ${
                  isDragOver
                    ? "from-[#eef6ff] to-[#dcecff] ring-2 ring-[#4b82f8]"
                    : "from-[#f8f8f8] to-[#e8e8e8] hover:from-[#f0f0f0] hover:to-[#e0e0e0]"
                }`}
              >
                {uploadedImage ? (
                  <>
                    <img src={uploadedImage} alt="업로드한 이미지" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/10">
                      <div className="rounded-full bg-white/90 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                        <Upload className="h-5 w-5 text-black" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
                      <Upload className="h-7 w-7 text-[#6b6b6b]" />
                    </div>
                    <p className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b]">프로필 이미지 1장 업로드</p>
                    <p className="font-['Noto_Sans_KR'] text-[12px] text-[#8b93a1]">
                      사진을 클릭하거나 드래그해서 올려주세요
                    </p>
                  </div>
                )}
              </div>
            </div>

            {uploadedImage ? (
              <div
                className={`rounded-[16px] px-4 py-3 font-['Noto_Sans_KR'] text-[13px] ${
                  faceStatus === "valid"
                    ? "bg-emerald-50 text-emerald-700"
                    : faceStatus === "checking"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-rose-50 text-rose-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  {faceStatus === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  <span>{faceMessage || "얼굴 분석 상태를 확인해 주세요."}</span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-3 lg:pt-2">
            <div className="rounded-[16px] border border-[#e8edf3] bg-white p-4 shadow-[0_10px_24px_rgba(17,24,39,0.04)]">
              <h3 className="mb-2 font-['Noto_Sans_KR'] text-[14px] font-semibold text-[#111827]">권장 업로드 기준</h3>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                <li className="flex items-start gap-2 py-1">
                  <CheckCircle2 className="mt-[1px] h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span className="font-['Noto_Sans_KR'] text-[12px] leading-[1.45] text-[#334155]">정면 또는 정면에 가까운 각도</span>
                </li>
                <li className="flex items-start gap-2 py-1">
                  <CheckCircle2 className="mt-[1px] h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span className="font-['Noto_Sans_KR'] text-[12px] leading-[1.45] text-[#334155]">눈, 코, 입 윤곽이 선명한 사진</span>
                </li>
                <li className="flex items-start gap-2 py-1">
                  <CheckCircle2 className="mt-[1px] h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span className="font-['Noto_Sans_KR'] text-[12px] leading-[1.45] text-[#334155]">마스크/손/소품 등 얼굴 가림 최소화</span>
                </li>
                <li className="flex items-start gap-2 py-1">
                  <CheckCircle2 className="mt-[1px] h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span className="font-['Noto_Sans_KR'] text-[12px] leading-[1.45] text-[#334155]">어둡거나 흔들린 사진은 지양</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DiagnosisPageLayout>
  );
}
