import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'
import type { MagiUnit, MagiVote } from '../src/components/magi/types'
import { getFinalResult, getVetoUnit, hasVetoActivated } from '../src/components/magi/utils'
import { CACHE_TTL_SECONDS, generateCacheKey } from '../src/utils/magi'

const unit = (vote: MagiVote, confidence = 50): MagiUnit => ({
  name: 'Test unit',
  fullName: 'Test unit',
  role: 'Test role',
  modelName: 'Test model',
  modelId: 'Test model',
  vote,
  confidence,
  reason: 'Contract fixture',
  status: 'COMPLETED',
  revealed: true
})

test('a YES majority wins below the veto threshold', () => {
  assert.equal(getFinalResult([unit('YES'), unit('YES'), unit('NO', 89)]), 'AGREE')
})

for (const confidence of [90, 91]) {
  test(`a NO veto at confidence ${confidence} overrides a YES majority`, () => {
    assert.equal(getFinalResult([unit('YES'), unit('YES'), unit('NO', confidence)]), 'DENY')
  })
}

test('pending votes keep the result pending even when another unit has a veto', () => {
  assert.equal(getFinalResult([unit('PENDING'), unit('YES'), unit('NO', 90)]), 'PENDING')
})

test('a tied completed vote is denied', () => {
  assert.equal(getFinalResult([unit('YES'), unit('NO')]), 'DENY')
})

test('only NO votes at confidence 90 or above activate a veto', () => {
  assert.equal(hasVetoActivated([unit('YES', 100), unit('NO', 89)]), false)
  assert.equal(hasVetoActivated([unit('NO', 90)]), true)
})

test('the first qualifying veto retains its unit identity', () => {
  const firstVeto = unit('NO', 90)
  assert.equal(getVetoUnit([unit('YES'), firstVeto, unit('NO', 99)]), firstVeto)
  assert.equal(getVetoUnit([unit('YES', 100), unit('NO', 89)]), null)
})

test('cache keys normalize edge whitespace and case but preserve internal spaces', () => {
  assert.equal(generateCacheKey('  Example Question  '), 'magi:example question')
  assert.equal(generateCacheKey('EXAMPLE QUESTION'), 'magi:example question')
  assert.notEqual(generateCacheKey('example question'), generateCacheKey('another question'))
  assert.notEqual(generateCacheKey('example question'), generateCacheKey('example  question'))
})

test('the Redis cache TTL is seven days in seconds', () => {
  assert.equal(CACHE_TTL_SECONDS, 604800)
})

const clientUrl = new URL('../src/utils/openai-client.ts', import.meta.url).href
const credentialProbe = `
const saved = {
  present: Object.hasOwn(process.env, 'OPENAI_API_KEY'),
  value: process.env.OPENAI_API_KEY
}
const state = { client: null, originalFetch: null, calls: 0, rejected: false }
try {
  const first = await import(${JSON.stringify(clientUrl)})
  const second = await import(${JSON.stringify(clientUrl)})
  if (first.openai !== second.openai) throw new Error('Client singleton changed')
  state.client = first.openai
  state.originalFetch = first.openai.fetch
  first.openai.fetch = async () => {
    state.calls += 1
    throw new Error('Network transport is prohibited in this test')
  }
  try {
    await first.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Offline credential boundary check' }]
    })
  } catch (error) {
    state.rejected = error instanceof Error &&
      error.message.includes('Missing required environment variable: OPENAI_API_KEY')
  }
  if (!state.rejected || state.calls !== 0) throw new Error('Credential boundary failed')
  console.log(JSON.stringify({ rejectedBeforeFetch: true, singletonStable: true, fetchCalls: 0 }))
} finally {
  if (state.client && state.originalFetch) state.client.fetch = state.originalFetch
  if (saved.present) process.env.OPENAI_API_KEY = saved.value
  else delete process.env.OPENAI_API_KEY
}
`

for (const { name, value } of [
  { name: 'missing', value: undefined },
  { name: 'empty', value: '' },
  { name: 'whitespace-only', value: ' \t\n ' }
]) {
  test(`a fresh client import rejects a ${name} API key before HTTP transport`, () => {
    const env = { ...process.env }
    delete env.OPENAI_API_KEY
    delete env.GEMINI_API_KEY
    delete env.REDIS_URL
    delete env.OPENAI_LOG
    if (value !== undefined) env.OPENAI_API_KEY = value
    const result = spawnSync(process.execPath, ['--eval', credentialProbe], {
      env,
      encoding: 'utf8',
      timeout: 20000
    })
    assert.equal(result.status, 0, 'The isolated credential boundary check must succeed')
    assert.deepEqual(JSON.parse(result.stdout), {
      rejectedBeforeFetch: true,
      singletonStable: true,
      fetchCalls: 0
    })
  })
}
