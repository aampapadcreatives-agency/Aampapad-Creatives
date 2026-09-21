import { defineConfig } from 'vite'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const statePath = resolve(process.cwd(), 'site-state.json')

const readState = async () => {
  try {
    return JSON.parse(await readFile(statePath, 'utf8'))
  } catch {
    return {}
  }
}

const sharedStatePlugin = () => ({
  name: 'aampapad-shared-state',
  configureServer(server) {
    server.middlewares.use('/api/site-state', async (request, response) => {
      if (request.method === 'GET') {
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify(await readState()))
        return
      }

      if (request.method !== 'PUT') {
        response.statusCode = 405
        response.end('Method Not Allowed')
        return
      }

      let body = ''
      request.on('data', (chunk) => { body += chunk })
      request.on('end', async () => {
        try {
          const payload = JSON.parse(body)
          const state = { content: payload.content || {}, projects: payload.projects || [], updatedAt: Date.now() }
          await writeFile(statePath, JSON.stringify(state, null, 2))
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify(state))
        } catch {
          response.statusCode = 400
          response.end('Invalid state payload')
        }
      })
    })
  },
})

export default defineConfig({
  plugins: [sharedStatePlugin()],
})