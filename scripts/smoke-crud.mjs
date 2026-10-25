import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

const baseUrl = (process.argv[2] ?? 'http://localhost:8080').replace(/\/$/, '')
const marker = `crud-check-${randomUUID()}`
let createdId
let deleted = false

async function send(method, path, body, expectedStatus, expectedCode) {
  const response = await fetch(baseUrl + path, {
    method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : undefined
  assert.equal(response.status, expectedStatus, `${method} ${path}: ${text}`)
  if (expectedCode) assert.equal(data.code, expectedCode)
  console.log(`${method} ${path} -> ${response.status}${expectedCode ? ` ${expectedCode}` : ''}`)
  return { response, data, text }
}

try {
  const before = await send('GET', '/api/tasks?size=1', undefined, 200)
  const created = await send('POST', '/api/tasks', { title: marker, description: 'CRUD smoke test' }, 201)
  createdId = created.data.id
  assert.equal(created.data.status, 'OPEN')
  assert.equal(created.response.headers.get('location'), `/api/tasks/${createdId}`)

  const updated = await send('PUT', `/api/tasks/${createdId}`, {
    title: `${marker}-updated`, description: null, status: 'IN_PROGRESS',
  }, 200)
  assert.equal(updated.data.description, null)

  const patched = await send('PATCH', `/api/tasks/${createdId}`, { status: 'DONE' }, 200)
  assert.equal(patched.data.title, `${marker}-updated`)
  await send('PATCH', `/api/tasks/${createdId}`, { status: 'DONE' }, 200)
  await send('PATCH', `/api/tasks/${createdId}`, { status: 'OPEN' }, 409, 'TASK_STATE_CONFLICT')
  await send('PUT', `/api/tasks/${createdId}`, { title: 'Must not change', status: 'OPEN' }, 409, 'TASK_STATE_CONFLICT')
  await send('PUT', `/api/tasks/${createdId}`, { title: '', status: 'DONE' }, 400, 'VALIDATION_ERROR')
  const stored = await send('GET', `/api/tasks/${createdId}`, undefined, 200)
  assert.equal(stored.data.title, `${marker}-updated`)
  assert.equal(stored.data.status, 'DONE')

  const removed = await send('DELETE', `/api/tasks/${createdId}`, undefined, 204)
  deleted = true
  assert.equal(removed.text, '')
  await send('DELETE', `/api/tasks/${createdId}`, undefined, 404, 'TASK_NOT_FOUND')
  const after = await send('GET', '/api/tasks?size=1', undefined, 200)
  assert.equal(after.data.totalElements, before.data.totalElements)
  console.log(`PASS: PostgreSQL CRUD; initial/final task count = ${after.data.totalElements}`)
} finally {
  if (createdId !== undefined && !deleted) {
    // Clean up only the task created by this execution, never the whole table.
    const remaining = await fetch(`${baseUrl}/api/tasks/${createdId}`, { signal: AbortSignal.timeout(15000) })
    if (remaining.ok && (await remaining.json()).title.startsWith(marker)) {
      await send('DELETE', `/api/tasks/${createdId}`, undefined, 204)
    }
  }
}
