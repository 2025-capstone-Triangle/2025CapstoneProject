import { useEffect, useRef, useState } from 'react';
import { DefaultTopBar } from '../../../shared/layout/DefaultTopBar';
import { Loader2, Upload } from 'lucide-react';
import { BackButton } from '../../../shared/layout/BackButton';
import { checkFaceAnalyzable } from '../lib/faceLandmarkCheck';
import {
  getStagedDiagnosisImageFiles,
  stageDiagnosisImageFiles,
} from '../lib/imageStaging';

interface ImageInputPageProps {
  onNext?: () => void;
  onBack?: () => void;
  onHome?: () => void;
}

export function ImageInputPage({ onNext, onBack, onHome }: ImageInputPageProps) {
  const [firstFile, setFirstFile] = useState<File | null>(() => getStagedDiagnosisImageFiles()[0] ?? null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [faceStatus, setFaceStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'error'>('idle');
  const [faceMessage, setFaceMessage] = useState('');
  const firstInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    setFirstFile(file);
  };

  const canProceed = Boolean(uploadedImage) && faceStatus === 'valid';

  useEffect(() => {
    if (!firstFile) return;
    stageDiagnosisImageFiles([firstFile]);
  }, [firstFile]);

  useEffect(() => {
    if (!firstFile) {
      setUploadedImage(null);
      return;
    }

    const previewUrl = URL.createObjectURL(firstFile);
    setUploadedImage(previewUrl);
    setFaceStatus('checking');
    setFaceMessage('얼굴 분석 중입니다...');

    let mounted = true;
    checkFaceAnalyzable(firstFile)
      .then((result) => {
        if (!mounted) return;
        setFaceStatus(result.ok ? 'valid' : 'invalid');
        setFaceMessage(result.reason);
      })
      .catch(() => {
        if (!mounted) return;
        setFaceStatus('error');
        setFaceMessage('얼굴 분석에 실패했습니다.');
      });

    return () => {
      mounted = false;
      URL.revokeObjectURL(previewUrl);
    };
  }, [firstFile]);

  return (
    <div className="bg-white h-full min-h-0 diag-page-root w-full max-w-[980px] mx-auto flex flex-col">
      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />

      <div className="mx-auto w-full max-w-[720px] flex-1 px-6 sm:px-8 lg:px-10 pt-8 pb-28 md:pb-8">
        <h2 className="font-['Noto_Sans_KR'] font-semibold text-[16px] text-black text-center mb-8">
          얼굴이 나온 사진을 넣어보세요
        </h2>

        <div className="mb-8">
          <input
            ref={firstInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />
          <button
            onClick={() => firstInputRef.current?.click()}
            className="w-full aspect-square rounded-[16px] overflow-hidden bg-gradient-to-br from-[#f8f8f8] to-[#e8e8e8] flex items-center justify-center relative group hover:from-[#f0f0f0] hover:to-[#e0e0e0] transition-all"
          >
            {uploadedImage ? (
              <>
                <img
                  src={uploadedImage}
                  alt="업로드된 이미지"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                    <Upload className="w-5 h-5 text-black" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                  <Upload className="w-7 h-7 text-[#6b6b6b]" />
                </div>
                <p className="font-['Noto_Sans_KR'] text-[13px] text-[#6b6b6b]">
                  프로필 이미지 1장 업로드
                </p>
              </div>
            )}
          </button>
        </div>

        <div className="bg-[#f8f8f8] rounded-[16px] p-5 mb-4">
          <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b] leading-[1.6] text-center">
            얼굴이 정면으로 나온 사진을 업로드하면
            <br />
            더 정확한 분석이 가능합니다.
          </p>
        </div>

        {uploadedImage ? (
          <div
            className={`rounded-[16px] px-4 py-3 text-[13px] font-['Noto_Sans_KR'] ${
              faceStatus === 'valid'
                ? 'bg-emerald-50 text-emerald-700'
                : faceStatus === 'checking'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-rose-50 text-rose-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {faceStatus === 'checking' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{faceMessage || '얼굴 분석 상태를 확인해 주세요.'}</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#f0f0f0] w-full max-w-[980px] mx-auto md:static md:border-t-0 md:bg-transparent md:backdrop-blur-0">
        <div className="mx-auto max-w-[720px] p-4 sm:p-6 md:px-8 lg:px-10 md:pt-2 md:pb-8">
          <button
            onClick={onNext}
            disabled={!canProceed}
            className="w-full bg-black rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-colors"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}


