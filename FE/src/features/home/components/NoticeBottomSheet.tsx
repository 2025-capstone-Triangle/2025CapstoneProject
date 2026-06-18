import { type Notice } from "../../notice/lib/noticeApi";

type NoticeBottomSheetProps = {
  open: boolean;
  loading: boolean;
  error: string;
  pinnedItems: Notice[];
  items: Notice[];
  onClose: () => void;
};

export function NoticeBottomSheet({
  open,
  loading,
  error,
  pinnedItems,
  items,
  onClose,
}: NoticeBottomSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 sm:p-5" onClick={onClose}>
      <div
        className="w-full max-w-[420px] rounded-[24px] border border-[#ececec] bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="mb-3 font-['NEXON_Football_Gothic'] text-[18px] text-black">공지사항</h3>

        {loading ? (
          <p className="font-['Noto_Sans_KR'] text-[13px] text-[#666]">불러오는 중입니다...</p>
        ) : error ? (
          <p className="font-['Noto_Sans_KR'] text-[13px] text-[#d92d20]">{error}</p>
        ) : (
          <div className="max-h-[58vh] space-y-2 overflow-y-auto pr-1">
            {pinnedItems.map((item) => (
              <article
                key={`p-${item.id}`}
                className="rounded-[12px] border border-[#ffd9e3] bg-[#fff4f7] px-3 py-2"
              >
                <p className="mb-1 font-['Noto_Sans_KR'] text-[11px] text-[#EF466F]">고정 공지</p>
                <p className="font-['Noto_Sans_KR'] text-[13px] font-semibold text-black">{item.title}</p>
                <p className="mt-1 line-clamp-3 font-['Noto_Sans_KR'] text-[12px] text-[#555]">{item.content}</p>
              </article>
            ))}

            {items.map((item) => (
              <article key={item.id} className="rounded-[12px] border border-[#efefef] bg-white px-3 py-2">
                <p className="font-['Noto_Sans_KR'] text-[13px] font-semibold text-black">{item.title}</p>
                <p className="mt-1 line-clamp-3 font-['Noto_Sans_KR'] text-[12px] text-[#555]">{item.content}</p>
              </article>
            ))}

            {items.length === 0 && pinnedItems.length === 0 ? (
              <p className="font-['Noto_Sans_KR'] text-[12px] text-[#777]">등록된 공지사항이 없습니다.</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
