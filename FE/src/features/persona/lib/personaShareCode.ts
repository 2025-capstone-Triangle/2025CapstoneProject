const PENDING_PERSONA_CODE_KEY = "pendingPersonaCode";
const PENDING_PERSONA_IS_SELF_KEY = "pendingPersonaIsSelf";
const CODE_PREFIX = "PRS";
const CODE_SEGMENT_LENGTH = 4;

export function normalizePersonaCode(rawCode: string) {
  const compact = rawCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!compact.startsWith(CODE_PREFIX)) return rawCode.trim().toUpperCase();

  const requiredLength = CODE_PREFIX.length + CODE_SEGMENT_LENGTH * 2;
  if (compact.length !== requiredLength) return rawCode.trim().toUpperCase();

  return `${compact.slice(0, 3)}-${compact.slice(3, 7)}-${compact.slice(7, 11)}`;
}

export function setPendingPersonaCode(code: string) {
  localStorage.setItem(PENDING_PERSONA_CODE_KEY, normalizePersonaCode(code));
}

export function getPendingPersonaCode() {
  const raw = localStorage.getItem(PENDING_PERSONA_CODE_KEY);
  return raw ? normalizePersonaCode(raw) : null;
}

export function clearPendingPersonaCode() {
  localStorage.removeItem(PENDING_PERSONA_CODE_KEY);
  localStorage.removeItem(PENDING_PERSONA_IS_SELF_KEY);
}

export function setPendingPersonaIsSelf(isSelf: boolean) {
  if (isSelf) {
    localStorage.setItem(PENDING_PERSONA_IS_SELF_KEY, "1");
  } else {
    localStorage.removeItem(PENDING_PERSONA_IS_SELF_KEY);
  }
}

export function getPendingPersonaIsSelf() {
  return localStorage.getItem(PENDING_PERSONA_IS_SELF_KEY) === "1";
}
