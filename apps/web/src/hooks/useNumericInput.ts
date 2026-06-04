"use client";

import { useCallback, useEffect, useState } from "react";

function sanitizeNumericString(raw: string, allowDecimal: boolean): string {
  let s = raw.replace(allowDecimal ? /[^\d.]/g : /\D/g, "");
  if (!allowDecimal) {
    if (s === "") return "";
    return String(parseInt(s, 10));
  }
  const parts = s.split(".");
  if (parts.length > 2) s = `${parts[0]}.${parts.slice(1).join("")}`;
  if (s.startsWith(".")) s = `0${s}`;
  if (s === "") return "";
  const [intPart, decPart] = s.split(".");
  const normalizedInt = intPart === "" ? "" : String(parseInt(intPart, 10));
  if (decPart === undefined) return normalizedInt;
  return `${normalizedInt}.${decPart}`;
}

export function useNumericInput(
  value: number,
  onChange: (n: number) => void,
  opts?: { min?: number; max?: number; allowDecimal?: boolean }
) {
  const allowDecimal = opts?.allowDecimal ?? true;
  const [text, setText] = useState(() => (Number.isFinite(value) ? String(value) : ""));

  useEffect(() => {
    const next = Number.isFinite(value) ? String(value) : "";
    setText((prev) => {
      const prevNum = parseDisplay(prev);
      if (prevNum === value && prev !== "" && prev !== ".") return prev;
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function parseDisplay(s: string): number {
    if (s === "" || s === ".") return opts?.min ?? 0;
    const n = allowDecimal ? parseFloat(s) : parseInt(s, 10);
    if (!Number.isFinite(n)) return opts?.min ?? 0;
    let out = n;
    if (opts?.min != null) out = Math.max(opts.min, out);
    if (opts?.max != null) out = Math.min(opts.max, out);
    return out;
  }

  const handleChange = useCallback(
    (raw: string) => {
      const cleaned = sanitizeNumericString(raw, allowDecimal);
      setText(cleaned);
      if (cleaned !== "" && cleaned !== ".") onChange(parseDisplay(cleaned));
    },
    [allowDecimal, onChange, opts?.min, opts?.max]
  );

  const handleBlur = useCallback(() => {
    const n = parseDisplay(text);
    onChange(n);
    setText(String(n));
  }, [text, onChange, opts?.min, opts?.max]);

  return { text, handleChange, handleBlur, parseDisplay };
}
