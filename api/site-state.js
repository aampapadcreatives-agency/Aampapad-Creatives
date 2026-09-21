import { list, put } from '@vercel/blob'

const statePath = 'aampapad/site-state.json'

const sendJson = (response, status, body) => {
  response.status(status).setHeader('Cache-Control', 'no-store').json(body)
}

const readState = async () => {
  const result = await list({ prefix: statePath, limit: 1 })
  const blob = result.blobs.find((item) => item.pathname === statePath)
  if (!blob) return {}

  const response = await fetch(blob.url, { cache: 'no-store' })
  if (!response.ok) throw new Error('Unable to read shared site state')
  return response.json()
}

export default async function handler(request, response) {
  if (request.method === 'GET') {
    try {
      return sendJson(response, 200, await readState())
    } catch (error) {
      console.error(error)
      return sendJson(response, 500, { error: 'Unable to read shared site state' })
    }
  }

  if (request.method !== 'PUT') return sendJson(response, 405, { error: 'Method Not Allowed' })

  try {
    const payload = typeof request.body === 'string' ? JSON.parse(request.body) : request.body
    const state = {
      content: payload?.content || {},
      projects: payload?.projects || [],
      updatedAt: Date.now(),
    }

    await put(statePath, JSON.stringify(state), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    })

    return sendJson(response, 200, state)
  } catch (error) {
    console.error(error)
    return sendJson(response, 400, { error: 'Invalid state payload' })
  }
}
