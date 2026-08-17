export type ParsedLine = { title: string; desc: string; step?: string };

export function parseMultilineField(
  text: string | null | undefined,
  fallbackPrefix: string
): ParsedLine[] {
  if (!text?.trim()) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const colon = line.indexOf(":");
      if (colon > 0) {
        return {
          title: line.slice(0, colon).trim(),
          desc: line.slice(colon + 1).trim(),
          step: `0${i + 1}`.slice(-2),
        };
      }
      return {
        title: `${fallbackPrefix} ${i + 1}`,
        desc: line,
        step: `0${i + 1}`.slice(-2),
      };
    });
}
