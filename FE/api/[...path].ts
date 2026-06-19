const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function getRequestBody(req: any) {
  if (req.method === "GET" || req.method === "HEAD") return Promise.resolve(undefined);

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function pipeResponseBody(upstream: Response, res: any) {
  if (!upstream.body) {
    res.end();
    return;
  }

  const reader = upstream.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}

export default async function handler(req: any, res: any) {
  const apiOrigin = process.env.API_ORIGIN?.replace(/\/+$/, "");

  if (!apiOrigin) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ code: "PROXY_CONFIG_MISSING", message: "API proxy is not configured.", data: null }));
    return;
  }

  const targetUrl = new URL(req.url ?? "/api", apiOrigin);
  const headers = new Headers();

  Object.entries(req.headers ?? {}).forEach(([key, value]) => {
    const normalizedKey = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(normalizedKey)) return;
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(key, item));
      return;
    }
    if (typeof value === "string") headers.set(key, value);
  });

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: await getRequestBody(req),
    });

    res.statusCode = upstream.status;
    upstream.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    await pipeResponseBody(upstream, res);
  } catch {
    res.statusCode = 502;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ code: "PROXY_BAD_GATEWAY", message: "API proxy request failed.", data: null }));
  }
}
