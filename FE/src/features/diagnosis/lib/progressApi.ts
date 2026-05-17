const API_BASE_ENV = import.meta.env.VITE_API_BASE_URL?.trim();
const PROGRESS_API_BASE_URL =
  import.meta.env.VITE_PROGRESS_API_BASE_URL?.trim() || "https://13.209.17.191.nip.io";
const IS_HTTPS_PAGE = typeof window !== "undefined" && window.location.protocol === "https:";
const IS_DEV = Boolean(import.meta.env.DEV);
const API_BASE =
  !IS_DEV
    ? ""
    : IS_HTTPS_PAGE && API_BASE_ENV?.startsWith("http://")
      ? ""
      : (API_BASE_ENV ?? "");

function buildApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_BASE) return path;

  const base = API_BASE.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

function buildProgressApiUrl(sessionId: string) {
  const normalizedPath = `/api/v1/progress/${encodeURIComponent(sessionId)}`;
  if (PROGRESS_API_BASE_URL) {
    const base = PROGRESS_API_BASE_URL.replace(/\/+$/, "");
    return `${base}${normalizedPath}`;
  }
  return buildApiUrl(normalizedPath);
}

function getSavedAccessToken() {
  const raw = localStorage.getItem("auth");
  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw) as { accessToken?: string; grantType?: string };
    if (!parsed.accessToken) return "";
    return `${parsed.grantType ?? "Bearer"} ${parsed.accessToken}`;
  } catch {
    return "";
  }
}

function parseEventPayload(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed) as DiagnosisProgressEventPayload;
  } catch {
    return {
      message: trimmed,
    } satisfies DiagnosisProgressEventPayload;
  }
}

function parseSseBlock(block: string): DiagnosisProgressEvent | null {
  const lines = block.split(/\r?\n/);
  let event = "message";
  const dataLines: string[] = [];

  for (const line of lines) {
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("event:")) {
      event = line.slice(6).trim() || "message";
      continue;
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  if (!dataLines.length) {
    return {
      event,
      rawData: "",
      data: null,
    };
  }

  const rawData = dataLines.join("\n");
  return {
    event,
    rawData,
    data: parseEventPayload(rawData),
  };
}

export type DiagnosisProgressEventPayload = {
  sessionId?: string;
  progress?: number;
  message?: string;
  step?: string;
  [key: string]: unknown;
};

export type DiagnosisProgressEvent = {
  event: string;
  rawData: string;
  data: DiagnosisProgressEventPayload | null;
};

interface OpenDiagnosisProgressStreamOptions {
  sessionId: string;
  onOpen?: () => void;
  onEvent?: (event: DiagnosisProgressEvent) => void;
  onError?: (error: Error) => void;
}

export function createDiagnosisSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `diag-${crypto.randomUUID()}`;
  }

  return `diag-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function openDiagnosisProgressStream({
  sessionId,
  onOpen,
  onEvent,
  onError,
}: OpenDiagnosisProgressStreamOptions) {
  const controller = new AbortController();

  void (async () => {
    try {
      const url = buildProgressApiUrl(sessionId);
      const headers = new Headers({
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
      });
      const authHeader = getSavedAccessToken();
      if (authHeader) {
        headers.set("Authorization", authHeader);
      }

      const response = await fetch(url, {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`SSE 연결 실패 (${response.status})`);
      }

      onOpen?.();

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (!controller.signal.aborted) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let separatorIndex = buffer.search(/\r?\n\r?\n/);
        while (separatorIndex >= 0) {
          const block = buffer.slice(0, separatorIndex);
          buffer = buffer.slice(separatorIndex + (buffer[separatorIndex] === "\r" ? 4 : 2));

          const parsed = parseSseBlock(block);
          if (parsed) {
            onEvent?.(parsed);
          }

          separatorIndex = buffer.search(/\r?\n\r?\n/);
        }
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      const wrapped = error instanceof Error ? error : new Error("SSE 연결 중 오류가 발생했습니다.");
      onError?.(wrapped);
    }
  })();

  return () => controller.abort();
}
