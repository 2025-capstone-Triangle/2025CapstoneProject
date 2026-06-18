import type { ReactNode } from "react";

interface InputReviewCardProps {
  title: string;
  done: boolean;
  children: ReactNode;
}

export function InputReviewCard({ title, done, children }: InputReviewCardProps) {
  return (
    <div className="rounded-[16px] border border-[#ececec] bg-[#f8f8f8] p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-['Noto_Sans_KR'] text-[15px] font-semibold text-black">{title}</h3>
        <span className="font-['Noto_Sans_KR'] text-[12px] font-semibold text-[#EF466F]">{done ? "완료" : "미완료"}</span>
      </div>
      {children}
    </div>
  );
}
