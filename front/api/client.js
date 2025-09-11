// src/api/client.js
import { API_BASE_URL } from "../config/api";

export async function api(path, { method = "GET", body, token, withCookie } = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    ...(withCookie ? { credentials: "include" } : {}), // 백엔드가 쿠키 세션이면 사용
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  let data = null;
  try { data = await res.json(); } catch (_) {}

  if (!res.ok) {
    // 백엔드 에러 포맷을 그대로 보여주거나 가공
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}