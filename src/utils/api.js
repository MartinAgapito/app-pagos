const BASE = import.meta.env.VITE_API_URL

// GET /data/{type} — retorna los datos parseados o null si no hay API/datos
export async function fetchData(type) {
  if (!BASE) return null
  try {
    const res = await fetch(`${BASE}/data/${type}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// PUT /data/{type} — guarda en la nube (fire-and-forget, no bloquea)
export function saveData(type, data) {
  if (!BASE) return
  fetch(`${BASE}/data/${type}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  }).catch(() => {})
}
