export function safeHost(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function safeHostname(url) {
  return safeHost(url) || "";
}

export function safeProtocol(url) {
  try {
    return new URL(url).protocol.toLowerCase();
  } catch {
    return null;
  }
}

export function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'");
}

export function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtml(match[1].replace(/\s+/g, " ").trim()) : null;
}
