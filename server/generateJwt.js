import { createHmac } from 'node:crypto'

export function generateN8nJwt(secret) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString(
    'base64url',
  )
  const payload = Buffer.from(
    JSON.stringify({ iat: Math.floor(Date.now() / 1000) }),
  ).toString('base64url')
  const signature = createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url')

  return `${header}.${payload}.${signature}`
}
