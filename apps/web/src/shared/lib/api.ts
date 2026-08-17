"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type ApiError = {
  error?: string | { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
  message?: string;
};

/** Convierte respuestas de error del API en texto legible (evita "[object Object]"). */
export function formatApiError(data: unknown, status: number): string {
  if (!data || typeof data !== "object") {
    return `Error del servidor (HTTP ${status})`;
  }
  const d = data as ApiError;
  if (typeof d.message === "string" && d.message.trim()) return d.message;
  if (typeof d.error === "string" && d.error.trim()) return d.error;
  if (d.error && typeof d.error === "object") {
    const flat = d.error;
    const parts: string[] = [];
    if (flat.formErrors?.length) parts.push(...flat.formErrors);
    if (flat.fieldErrors) {
      for (const [field, errs] of Object.entries(flat.fieldErrors)) {
        if (errs?.length) parts.push(`${field}: ${errs.join(", ")}`);
      }
    }
    if (parts.length) return parts.join(" · ");
  }
  return `Error del servidor (HTTP ${status})`;
}

export async function apiFetch<T>(
  path: string,
  opts?: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    token?: string | null;
    body?: unknown;
  }
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (opts?.token) headers.Authorization = `Bearer ${opts.token}`;

  const res = await fetch(url, {
    method: opts?.method ?? "GET",
    headers,
    body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    let data: ApiError | null = null;
    try {
      data = (await res.json()) as ApiError;
    } catch {
      // ignore
    }
    throw new Error(formatApiError(data, res.status));
  }

  return (await res.json()) as T;
}

