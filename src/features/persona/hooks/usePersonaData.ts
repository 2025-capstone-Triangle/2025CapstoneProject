export type Persona = {
  id: string;
  name: string;
  description: string;
};

const MOCK_PERSONAS: Persona[] = [
  { id: "p1", name: "Explorer", description: "Curious, trend-driven persona" },
  { id: "p2", name: "Minimalist", description: "Clean, focused aesthetic persona" },
];

export function usePersonaData() {
  return {
    personas: MOCK_PERSONAS,
  };
}
