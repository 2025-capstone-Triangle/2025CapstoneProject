import { useState, useRef } from 'react';
import { StatusBar } from '../../../shared/layout/StatusBar';
import { DefaultTopBar } from '../../../shared/layout/DefaultTopBar';
import { Upload } from 'lucide-react';
import { BackButton } from '../../../shared/layout/BackButton';

interface ImageInputPageProps {
  onNext?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  onHome?: () => void;
}

export function ImageInputPage({ onNext, onSkip, onBack, onHome }: ImageInputPageProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [secondImage, setSecondImage] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const secondInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (position: 'first' | 'second', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (position === 'first') {
        setUploadedImage(reader.result as string);
      } else {
        setSecondImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white min-h-screen max-w-[390px] mx-auto">      <DefaultTopBar onTitleClick={onHome} showNotification={false} />
      <BackButton onClick={onBack} />
      
      <div className="px-8 pt-8">
        <h2 className="font-['Noto_Sans_KR'] font-semibold text-[16px] text-black text-center mb-8">
          얼굴이 잘 나온 사진을 넣어보세요
        </h2>

        {/* Images Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* First Image */}
          <div>
            <input
              ref={firstInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload('first', file);
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
                    사진 1
                  </p>
                </div>
              )}
            </button>
          </div>

          {/* Second Image */}
          <div>
            <input
              ref={secondInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload('second', file);
              }}
            />
            <button
              onClick={() => secondInputRef.current?.click()}
              className="w-full aspect-square rounded-[16px] overflow-hidden bg-[#f8f8f8] flex items-center justify-center relative group hover:bg-[#f0f0f0] transition-all border-2 border-dashed border-[#d0d0d0] hover:border-[#b0b0b0]"
            >
              {secondImage ? (
                <>
                  <img 
                    src={secondImage} 
                    alt="업로드된 이미지 2" 
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
                  <span className="text-[56px] text-[#d0d0d0] leading-none">+</span>
                  <p className="font-['Noto_Sans_KR'] text-[12px] text-[#6b6b6b]">
                    사진 2 (선택)
                  </p>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Info Text */}
        <div className="bg-[#f8f8f8] rounded-[16px] p-5 mb-8">
          <p className="font-['Noto_Sans_KR'] text-[14px] text-[#6b6b6b] leading-[1.6] text-center">
            얼굴이 정면으로 잘 나온 사진을 업로드하면<br />
            더 정확한 분석이 가능합니다
          </p>
        </div>
      </div>

      {/* Fixed Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#f0f0f0] p-6 max-w-[390px] mx-auto">
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="bg-[#f0f0f0] rounded-[16px] h-[56px] px-8 font-['Noto_Sans_KR'] font-medium text-[15px] text-[#262626] hover:bg-[#e5e5e5] transition-colors"
          >
            건너뛰기
          </button>
          <button
            onClick={onNext}
            disabled={!uploadedImage}
            className="flex-1 bg-black rounded-[16px] h-[56px] font-['Noto_Sans_KR'] font-semibold text-[16px] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition-colors"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}


