const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api')
  .replace(/\/+$/, '')

async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('Could not connect to the API. Check that the server is running and try again.')
  }

  const body = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const validationMessages = body?.errors
      ? Object.values(body.errors).flat().filter(Boolean)
      : []
    const message = validationMessages.join(' ') || body?.message
    throw new Error(message || `The request failed (${response.status}).`)
  }

  return body
}

function normalizeClients(response) {
  const clients = Array.isArray(response) ? response : response?.data
  if (!Array.isArray(clients)) {
    throw new Error('The API returned an unexpected client list.')
  }
  return clients
}

export async function fetchClients(phone = '') {
  const query = phone ? `?phone=${encodeURIComponent(phone)}` : ''
  return normalizeClients(await request(`/clients${query}`))
}

export function createClient(client) {
  return request('/clients', {
    method: 'POST',
    body: JSON.stringify(client),
  })
}

export function updateClient(id, changes) {
  return request(`/clients/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  })
}

export function deleteClient(id) {
  return request(`/clients/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
