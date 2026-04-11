/**
 * api.js — All HTTP calls to the backend in one place.
 * Every function returns a parsed JSON response or throws on error.
 */

const BASE_URL = 'http://localhost:3001/api';

let getToken = async () => null;
export function setTokenGetter(fn) { getToken = fn; }

async function apiFetch(path, options = {}) {
    const token = await getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: { ...headers, ...(options.headers || {}) },
    });
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || data.error || 'API error');
    return data;
}

export const api = {
    // ── Sections ──────────────────────────────────────────────
    getSections:   ()           => apiFetch('/sections'),
    createSection: (body)       => apiFetch('/sections', { method: 'POST', body: JSON.stringify(body) }),
    updateSection: (id, body)   => apiFetch(`/sections/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteSection: (id)         => apiFetch(`/sections/${id}`, { method: 'DELETE' }),

    // ── Tasks ─────────────────────────────────────────────────
    getTasks:    (sid)          => apiFetch(`/sections/${sid}/tasks`),
    createTask:  (sid, body)    => apiFetch(`/sections/${sid}/tasks`, { method: 'POST', body: JSON.stringify(body) }),
    updateTask:  (sid, tid, b)  => apiFetch(`/sections/${sid}/tasks/${tid}`, { method: 'PUT', body: JSON.stringify(b) }),
    deleteTask:  (sid, tid)     => apiFetch(`/sections/${sid}/tasks/${tid}`, { method: 'DELETE' }),
};
