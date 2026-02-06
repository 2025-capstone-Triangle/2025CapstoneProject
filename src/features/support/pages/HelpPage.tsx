import { ChevronLeft, ChevronRight, Mail, MessageCircle, FileText, HelpCircle } from 'lucide-react';

interface HelpPageProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

function HelpTopBar({ onBack }: { onBack?: () => void }) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
      <div className="h-[56px] flex items-center px-4">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={onBack}
        >
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="flex-1 text-center font-['NEXON_Football_Gothic'] font-bold text-[17px] text-black pr-9">
          고객지원
        </h1>
      </div>
    </div>
  );
}

interface HelpItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  onClick?: () => void;
}

function HelpItem({ icon: Icon, label, description, onClick }: HelpItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-700" />
      </div>
      <div className="flex-1 text-left">
        <p className="font-['Noto_Sans_KR'] text-[15px] font-medium text-black">
          {label}
        </p>
        {description && (
          <p className="font-['Noto_Sans_KR'] text-[12px] text-gray-500 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group px-6 py-4 border-b border-gray-100 last:border-0">
      <summary className="flex items-start gap-3 cursor-pointer list-none">
        <HelpCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-['Noto_Sans_KR'] text-[14px] font-medium text-black">
            {question}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-90" />
      </summary>
      <div className="mt-3 ml-8 pr-8">
        <p className="font-['Noto_Sans_KR'] text-[13px] text-gray-600 leading-relaxed">
          {answer}
        </p>
      </div>
    </details>
  );
}

export function HelpPage({ onBack, onNavigate }: HelpPageProps) {
  const faqs = [
    {
      question: '페르소나는 어떻게 생성하나요?',
      answer: '홈 화면에서 "나만의 페르소나 만들기"를 선택하고, 이미지와 음성을 업로드한 후 선호도 테스트를 완료하면 AI가 자동으로 페르소나를 생성합니다.'
    },
    {
      question: '생성된 콘텐츠는 어디에 저장되나요?',
      answer: '콘텐츠 생성 후 북마크 버튼을 누르면 해당 페르소나의 저장된 콘텐츠에 자동으로 저장됩니다. 페르소나 상세 페이지에서 확인할 수 있습니다.'
    },
    {
      question: '템플릿을 저장하려면 어떻게 하나요?',
      answer: '"요즘 뜨는 컨텐츠" 페이지에서 마음에 드는 템플릿의 하트 아이콘을 누르면 저장됩니다. 저장된 템플릿은 북마크 아이콘을 눌러 확인할 수 있습니다.'
    },
    {
      question: '페르소나는 몇 개까지 만들 수 있나요?',
      answer: '제한 없이 원하는 만큼 페르소나를 생성할 수 있습니다. 각 페르소나는 독립적으로 관리되며, 각각 다른 스타일의 콘텐츠를 생성할 수 있습니다.'
    },
    {
      question: '콘텐츠 비율은 어떻게 선택하나요?',
      answer: '콘텐츠 생성 시작 시 1:1(프로필용), 4:5(피드용), 9:16(스토리용) 중 원하는 비율을 선택할 수 있습니다.'
    },
    {
      question: '생성된 콘텐츠를 수정할 수 있나요?',
      answer: '현재 버전에서는 재생성 기능을 통해 새로운 콘텐츠를 만들 수 있습니다. 직접 수정 기능은 추후 업데이트 예정입니다.'
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen max-w-[390px] mx-auto">      <HelpTopBar onBack={onBack} />
      
      <div className="py-4">
        {/* Contact Options */}
        <div className="mb-6">
          <h2 className="px-6 py-3 font-['NEXON_Football_Gothic'] font-bold text-[13px] text-gray-500 uppercase tracking-wide">
            문의하기
          </h2>
          <div className="bg-white border-y border-gray-100">
            <HelpItem
              icon={Mail}
              label="이메일 문의"
              description="support@persona.com"
              onClick={() => window.location.href = 'mailto:support@persona.com'}
            />
            <HelpItem
              icon={FileText}
              label="공지사항"
              onClick={() => alert('공지사항 페이지 (준비중)')}
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-6">
          <h2 className="px-6 py-3 font-['NEXON_Football_Gothic'] font-bold text-[13px] text-gray-500 uppercase tracking-wide">
            자주 묻는 질문
          </h2>
          <div className="bg-white border-y border-gray-100">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-8 text-center">
        <p className="font-['Noto_Sans_KR'] text-[12px] text-gray-500 mb-4">
          더 궁금한 점이 있으신가요?<br />
          언제든지 문의해 주세요!
        </p>
        <p className="font-['Noto_Sans_KR'] text-[11px] text-gray-400">
          평일 09:00 - 18:00 (주말 및 공휴일 휴무)
        </p>
      </div>
    </div>
  );
}


