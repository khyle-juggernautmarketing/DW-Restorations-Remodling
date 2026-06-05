import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { handleSubmitLead } from './server/handleSubmitLead.js'
import bookingsHandler from './api/bookings.js'

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

function createMockRes(res) {
  return {
    statusCode: 200,
    setHeader(name, value) {
      res.setHeader(name, value)
    },
    status(code) {
      this.statusCode = code
      return this
    },
    json(data) {
      res.statusCode = this.statusCode
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(data))
    },
    end() {
      res.statusCode = this.statusCode
      res.end()
    },
  }
}

function devApiPlugin() {
  return {
    name: 'dw-restorations-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        const env = loadEnv(server.config.mode, server.config.root, '')
        const processEnv = {
          N8N_WEBHOOK_URL: env.N8N_WEBHOOK_URL,
          N8N_AUTH_TOKEN: env.N8N_AUTH_TOKEN,
          NODE_ENV: 'development',
          ALLOWED_ORIGINS: env.ALLOWED_ORIGINS,
          KV_REST_API_URL: env.KV_REST_API_URL,
          KV_REST_API_TOKEN: env.KV_REST_API_TOKEN,
        }

        if (url === '/api/submit-lead' && req.method === 'POST') {
          const origin = req.headers.origin || ''
          try {
            const parsed = await readBody(req)
            const result = await handleSubmitLead(parsed, processEnv, {
              origin,
              ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress,
              referer: req.headers.referer || '',
              host: req.headers.host || '',
            })
            res.statusCode = result.status
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Cache-Control', 'no-store')
            res.end(JSON.stringify(result.body))
          } catch {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Server error' }))
          }
          return
        }

        if (url === '/api/bookings') {
          const mockReq = {
            method: req.method,
            headers: req.headers,
            body: req.method === 'POST' ? await readBody(req).catch(() => ({})) : {},
          }
          const mockRes = createMockRes(res)
          await bookingsHandler(mockReq, mockRes)
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devApiPlugin()],
})
