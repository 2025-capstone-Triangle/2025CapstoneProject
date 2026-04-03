import { Copy, Lock } from "lucide-react";

interface GuestSaveCodeModalProps {
  open: boolean;
  code: string;
  copied: boolean;
  onClose: () => void;
  onCopy: () => void;
  onMoveToSignup: () => void;
  onMoveToLogin: () => void;
}

export function GuestSaveCodeModal({
  open,
  code,
  copied,
  onClose,
  onCopy,
  onMoveToSignup,
  onMoveToLogin,
}: GuestSaveCodeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:p-5" onClick={onClose}>
      <div
        className="w-full max-w-[380px] rounded-[24px] border border-[#ececec] bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff3f5]">
            <Lock className="h-5 w-5 text-[#EF466F]" />
          </div>
          <p className="font-['NEXON_Football_Gothic'] text-[18px] text-black">로그인이 필요해요</p>
        </div>

        <p className="mb-4 font-['Noto_Sans_KR'] text-[13px] leading-[1.6] text-[#666]">
          현재는 계정이 없어 바로 저장할 수 없습니다. 아래 페르소나 코드를 복사해 두면,
          가입 또는 로그인 후 <span className="font-semibold text-black">내 페르소나</span>에서 바로 불러올 수 있어요.
        </p>

        <div className="mb-2 flex items-center justify-between gap-2 rounded-[14px] border border-[#e5e5e5] bg-[#fafafa] px-4 py-3">
          <span className="font-['NEXON_Football_Gothic'] text-[18px] tracking-[0.08em] text-black">{code}</span>
          <button
            onClick={onCopy}
            className="flex h-9 items-center gap-1.5 rounded-[10px] bg-black px-3 font-['Noto_Sans_KR'] text-[12px] text-white"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "복사됨" : "복사"}
          </button>
        </div>

        <p className="mb-5 font-['Noto_Sans_KR'] text-[12px] text-[#8a8a8a]">코드 형식: PRS-XXXX-XXXX</p>

        <div className="space-y-2.5">
          <button
            onClick={onMoveToSignup}
            className="h-[48px] w-full rounded-[14px] bg-black font-['Noto_Sans_KR'] text-[14px] font-semibold text-white"
          >
            회원가입 후 코드 입력하기
          </button>
          <button
            onClick={onMoveToLogin}
            className="h-[48px] w-full rounded-[14px] border border-[#e5e5e5] bg-white font-['Noto_Sans_KR'] text-[14px] font-semibold text-black"
          >
            로그인하러 가기
          </button>
          <button
            onClick={onClose}
            className="h-[44px] w-full rounded-[12px] bg-[#f7f7f7] font-['Noto_Sans_KR'] text-[13px] text-[#555]"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
