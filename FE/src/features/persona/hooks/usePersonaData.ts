export type Persona = {
  id: string;
  name: string;
  description: string;
};

export function usePersonaData() {
  return {
    personas: [] as Persona[],
  };
}
