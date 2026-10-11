const API_URL = import.meta.env.VITE_API_URL

export async function apiFetch(endpoint, options = {}) {
  const respuesta = await fetch(`${API_URL}${endpoint}`, options)

  return respuesta
}