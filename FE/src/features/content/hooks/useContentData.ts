export type ContentItem = {
  id: string;
  title: string;
  summary: string;
};

const MOCK_CONTENT: ContentItem[] = [
  { id: "c1", title: "Template A", summary: "Short caption template" },
  { id: "c2", title: "Template B", summary: "Long-form post template" },
];

export function useContentData() {
  return {
    items: MOCK_CONTENT,
  };
}
