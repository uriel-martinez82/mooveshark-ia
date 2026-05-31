import { generateText, streamText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { buildSystemPrompt, getAgentDefinition } from './definitions'
import type { AgentConfig, ChatMessage } from '@/types'

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = 'claude-sonnet-4-20250514'

// ─── Convert chat history to AI SDK format ────────────────────────────────────
function toMessages(history: ChatMessage[], userMessage: string) {
  const msgs = history.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))
  msgs.push({ role: 'user', content: userMessage })
  return msgs
}

// ─── Build system prompt for agent ───────────────────────────────────────────
function buildPrompt(config: AgentConfig, contextVariables: Record<string, string> = {}): string {
  const definition = getAgentDefinition(config.type)
  if (!definition) throw new Error(`Unknown agent type: ${config.type}`)

  return buildSystemPrompt(config.systemPrompt || definition.systemPromptTemplate, {
    ...contextVariables,
    tone:     config.tone,
    language: config.language,
  })
}

// ─── Non-streaming response ───────────────────────────────────────────────────
export async function runAgent({
  config,
  history,
  userMessage,
  contextVariables = {},
}: {
  config: AgentConfig
  history: ChatMessage[]
  userMessage: string
  contextVariables?: Record<string, string>
}): Promise<string> {
  const { text } = await generateText({
    model:    anthropic(MODEL),
    system:   buildPrompt(config, contextVariables),
    messages: toMessages(history, userMessage),
    maxTokens: 1024,
  })

  return text
}

// ─── Streaming response (returns ReadableStream for SSE) ─────────────────────
export function streamAgent({
  config,
  history,
  userMessage,
  contextVariables = {},
}: {
  config: AgentConfig
  history: ChatMessage[]
  userMessage: string
  contextVariables?: Record<string, string>
}) {
  return streamText({
    model:    anthropic(MODEL),
    system:   buildPrompt(config, contextVariables),
    messages: toMessages(history, userMessage),
    maxTokens: 1024,
  })
}
