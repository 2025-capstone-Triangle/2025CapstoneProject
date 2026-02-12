export interface ShareablePersona {
  name: string;
  description: string;
  colors: string[];
}

interface ShareablePersonaRecord extends ShareablePersona {
  createdAt: string;
}

const SHARED_PERSONA_STORE_KEY = "sharedPersonaCodes";
const PENDING_PERSONA_CODE_KEY = "pendingPersonaCode";
const CODE_PREFIX = "PRS";
const CODE_SEGMENT_LENGTH = 4;

function readSharedStore(): Record<string, ShareablePersonaRecord> {
  const raw = localStorage.getItem(SHARED_PERSONA_STORE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, ShareablePersonaRecord>;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function writeSharedStore(store: Record<string, ShareablePersonaRecord>) {
  localStorage.setItem(SHARED_PERSONA_STORE_KEY, JSON.stringify(store));
}

function randomSegment() {
  return Math.random()
    .toString(36)
    .slice(2, 2 + CODE_SEGMENT_LENGTH)
    .toUpperCase();
}

function buildCode() {
  return `${CODE_PREFIX}-${randomSegment()}-${randomSegment()}`;
}

export function normalizePersonaCode(rawCode: string) {
  const compact = rawCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!compact.startsWith(CODE_PREFIX)) return rawCode.trim().toUpperCase();

  const requiredLength = CODE_PREFIX.length + CODE_SEGMENT_LENGTH * 2;
  if (compact.length !== requiredLength) return rawCode.trim().toUpperCase();

  return `${compact.slice(0, 3)}-${compact.slice(3, 7)}-${compact.slice(7, 11)}`;
}

export function createPersonaShareCode(persona: ShareablePersona) {
  const store = readSharedStore();
  let code = buildCode();

  while (store[code]) {
    code = buildCode();
  }

  store[code] = {
    ...persona,
    colors: persona.colors.slice(0, 4),
    createdAt: new Date().toISOString(),
  };
  writeSharedStore(store);
  return code;
}

export function getPersonaByShareCode(rawCode: string) {
  const code = normalizePersonaCode(rawCode);
  const store = readSharedStore();
  const persona = store[code];

  if (!persona) return null;
  return { code, persona };
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
}

