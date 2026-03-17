import { Capture, Decision, NotificationSettings, Task } from "./types";
import { authClient } from "./supabase";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV !== "production" ? "http://127.0.0.1:8000/api" : "");

async function getAccessToken() {
  const { data } = await authClient.getSession();
  return data.session?.access_token;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is missing.");
  }
  const token = await getAccessToken();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(init?.headers || {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export const api = {
  listCaptures: () => request<Capture[]>("/captures"),
  createCapture: (payload: { raw_text: string; source: string; metadata?: Record<string, unknown> }) =>
    request<Capture>("/captures", { method: "POST", body: JSON.stringify(payload) }),
  listTasks: (params = new URLSearchParams()) => request<Task[]>(`/tasks?${params.toString()}`),
  patchTask: (id: string, payload: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  getDecision: (date: string) => request<Decision | null>(`/decisions?date=${date}`),
  generateDecision: (date: string) => request<Decision>(`/decisions/generate?date=${date}`, { method: "POST" }),
  getNotificationSettings: () => request<NotificationSettings>("/settings/notifications"),
  patchNotificationSettings: (payload: Partial<NotificationSettings>) =>
    request<NotificationSettings>("/settings/notifications", { method: "PATCH", body: JSON.stringify(payload) })
};
