const BACKEND_BASE_URL = "http://ec2-13-209-98-117.ap-northeast-2.compute.amazonaws.com:8080";

function buildTargetUrl(req) {
  const parts = Array.isArray(req.query.path)
    ? req.query.path
    : req.query.path
      ? [req.query.path]
      : [];

  const target = new URL(`/api/${parts.join("/")}`, BACKEND_BASE_URL);
  for (const [key, value] of Object.entries(req.query)) {
    if (key === "path") continue;
    if (Array.isArray(value)) {
      for (const item of value) target.searchParams.append(key, String(item));
    } else if (value !== undefined) {
      target.searchParams.set(key, String(value));
    }
  }
  return target;
}

function buildForwardHeaders(req) {
  const skip = new Set([
    "host",
    "origin",
    "referer",
    "content-length",
    "connection",
    "x-forwarded-for",
    "x-forwarded-host",
    "x-forwarded-port",
    "x-forwarded-proto",
  ]);

  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    const lower = key.toLowerCase();
    if (skip.has(lower)) continue;
    if (Array.isArray(value)) {
      headers[key] = value.join(", ");
    } else if (value !== undefined) {
      headers[key] = value;
    }
  }
  return headers;
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  try {
    const targetUrl = buildTargetUrl(req);
    const method = req.method || "GET";
    const headers = buildForwardHeaders(req);
    const shouldSendBody = method !== "GET" && method !== "HEAD";
    const body = shouldSendBody ? await readRawBody(req) : undefined;

    const upstream = await fetch(targetUrl, {
      method,
      headers,
      body: shouldSendBody ? body : undefined,
      redirect: "manual",
    });

    res.statusCode = upstream.status;
    upstream.headers.forEach((value, key) => {
      if (key.toLowerCase() === "transfer-encoding") return;
      res.setHeader(key, value);
    });

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.end(buffer);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        code: "PROXY_ERROR",
        message: error instanceof Error ? error.message : "Proxy request failed",
      })
    );
  }
};