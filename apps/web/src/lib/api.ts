"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type ApiError = { error?: string; message?: string };

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
    const msg = data?.error ?? data?.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return (await res.json()) as T;
}

