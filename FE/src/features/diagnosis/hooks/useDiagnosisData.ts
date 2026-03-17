export type DiagnosisResult = {
  id: string;
  title: string;
  summary: string;
};

export function useDiagnosisData() {
  return {
    results: [] as DiagnosisResult[],
  };
}
