export type DiagnosisResult = {
  id: string;
  title: string;
  summary: string;
};

const MOCK_RESULTS: DiagnosisResult[] = [
  { id: "d1", title: "Result A", summary: "Primary diagnosis summary" },
];

export function useDiagnosisData() {
  return {
    results: MOCK_RESULTS,
  };
}
