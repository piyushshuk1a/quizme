export const parseEmails = (text: string): string[] =>
  String(text || '')
    .split(/[\n,;,]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
