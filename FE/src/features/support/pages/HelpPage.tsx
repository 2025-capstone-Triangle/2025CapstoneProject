import { ChevronRight, FileText, HelpCircle, Mail } from "lucide-react";
import { DefaultTopBar } from "../../../shared/layout/DefaultTopBar";

interface HelpPageProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

interface HelpItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  onClick?: () => void;
}

function HelpItem({ icon: Icon, label, description, onClick }: HelpItemProps) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
        <Icon className="h-5 w-5 text-gray-700" />
      </div>
      <div className="flex-1 text-left">
        <p className="font-['Noto_Sans_KR'] text-[15px] font-medium text-black">{label}</p>
        {description ? <p className="mt-0.5 font-['Noto_Sans_KR'] text-[12px] text-gray-500">{description}</p> : null}
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </button>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border-b border-gray-100 px-6 py-4 last:border-0">
      <summary className="flex list-none cursor-pointer items-start gap-3">
        <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#4f46e5]" />
        <div className="flex-1">
          <p className="font-['Noto_Sans_KR'] text-[14px] font-medium text-black">{question}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-90" />
      </summary>
      <div className="ml-8 mt-3 pr-8">
        <p className="font-['Noto_Sans_KR'] text-[13px] leading-relaxed text-gray-600">{answer}</p>
      </div>
    </details>
  );
}

export function HelpPage({ onBack, onNavigate }: HelpPageProps) {
  const faqs = [
    {
      question: "페르소나는 어떻게 생성하나요?",
      answer:
        "메인 화면에서 '나만의 페르소나 만들기'를 선택하고, 이미지/음성/선호 테스트를 완료하면 AI가 자동으로 생성합니다.",
    },
    {
      question: "생성한 콘텐츠는 어디서 확인하나요?",
      answer:
        "콘텐츠 생성 후 저장한 결과는 페르소나 상세 화면과 저장 콘텐츠 화면에서 다시 확인할 수 있습니다.",
    },
    {
      question: "요즘 뜨는 콘텐츠는 어떤 기준인가요?",
      answer:
        "관리자에서 운영 중인 레퍼런스 목록을 기반으로 제공되며, 사용자 저장/사용 흐름에 따라 업데이트될 수 있습니다.",
    },
    {
      question: "회원 정보를 수정하려면 어떻게 해야 하나요?",
      answer:
        "설정 페이지에서 생년월일, 성별, 크리에이터 여부, 이메일, 비밀번호를 각각 변경할 수 있습니다.",
    },
    {
      question: "문의는 어디로 보내면 되나요?",
      answer: "설정 또는 고객지원 페이지의 1:1 문의 버튼을 통해 support@persona.com 으로 보낼 수 있습니다.",
    },
  ];

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-gradient-to-b from-[#fafafa] to-white md:h-full md:min-h-0">
      <DefaultTopBar onTitleClick={() => onNavigate?.("home")} showNotification={false} leftAction={onBack ? "back" : "none"} onBackClick={onBack} />

      <div className="mx-auto mb-3 w-full max-w-[1120px] px-4 pt-3 sm:px-8 md:px-10">
        <h1 className="font-['NEXON_Football_Gothic'] text-[clamp(18px,2.2vw,22px)] font-bold text-black">고객지원</h1>
      </div>

      <div className="page-scroll">
        <div className="mx-auto w-full max-w-[1120px] px-4 pb-8 sm:px-8 md:px-10">
          <div className="mb-6">
            <h2 className="px-1 py-3 font-['NEXON_Football_Gothic'] text-[13px] font-bold uppercase tracking-wide text-gray-500">문의하기</h2>
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <HelpItem icon={Mail} label="이메일 문의" description="support@persona.com" onClick={() => (window.location.href = "mailto:support@persona.com")} />
              <HelpItem icon={FileText} label="공지사항" description="업데이트 및 운영 안내" onClick={() => alert("공지사항 페이지 연결 예정")} />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="px-1 py-3 font-['NEXON_Football_Gothic'] text-[13px] font-bold uppercase tracking-wide text-gray-500">자주 묻는 질문</h2>
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              {faqs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>

          <div className="px-2 py-6 text-center">
            <p className="mb-3 font-['Noto_Sans_KR'] text-[12px] text-gray-500">
              추가 문의가 있다면 언제든지 메일로 문의해 주세요.
            </p>
            <p className="font-['Noto_Sans_KR'] text-[11px] text-gray-400">운영 시간 09:00 - 18:00 (주말 및 공휴일 제외)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
