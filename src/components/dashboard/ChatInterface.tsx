'use client'

import { useState, useRef, useEffect } from 'react'
import { getAgentDefinition } from '@/lib/agents/definitions'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
  timestamp: Date
}

interface AgentInfo {
  agentId: string
  agentName: string
  agentType: string
  agentAvatar: string
  agentColor: string
  specialty: string
  suggestedQuestions: string[]
  capabilities: string[]
}

function renderContent(content: string) {
  // Simple markdown: bold, bullet points, line breaks
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc pl-4 my-2 space-y-1">$&</ul>')
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n/g, '<br/>')
}

export function ChatInterface({ agentId, agentName, agentType }: {
  agentId: string
  agentName: string
  agentType: string
}) {
  const definition = getAgentDefinition(agentType)
  const agentInfo: AgentInfo = {
    agentId,
    agentName: definition?.agentName ?? agentName,
    agentType,
    agentAvatar:        definition?.agentAvatar ?? '🦈',
    agentColor:         definition?.agentColor  ?? '#00d4ff',
    specialty:          definition?.specialty   ?? '',
    suggestedQuestions: definition?.suggestedQuestions ?? [],
    capabilities:       definition?.capabilities ?? [],
  }

  const [messages, setMessages]             = useState<Message[]>([])
  const [input, setInput]                   = useState('')
  const [loading, setLoading]               = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [showInfo, setShowInfo]             = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const msg = text ?? input.trim()
    if (!msg || loading) return

    const userMsg: Message = {
      role: 'user', content: msg,
      id: Date.now().toString(), timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setShowInfo(false)

    try {
      const res  = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: msg, agentId, conversationId }),
      })
      const data = await res.json()

      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant', content: data.data.response,
          id: (Date.now() + 1).toString(), timestamp: new Date(),
        }])
        if (data.data.conversationId) setConversationId(data.data.conversationId)
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Hubo un error al procesar tu mensaje. Por favor intentá de nuevo.',
          id: (Date.now() + 1).toString(), timestamp: new Date(),
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error de conexión. Por favor revisá tu internet e intentá de nuevo.',
        id: (Date.now() + 1).toString(), timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">

      {/* ── CHAT MAIN ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Agent header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border border-white/8 rounded-2xl mb-3 bg-white/[0.02]">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: `${agentInfo.agentColor}20`, border: `1px solid ${agentInfo.agentColor}40` }}
          >
            {agentInfo.agentAvatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-display font-semibold text-white text-sm">{agentInfo.agentName}</p>
              <span className="text-[10px] text-white/40">·</span>
              <p className="text-xs text-white/40">{definition?.label}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400">En línea</span>
            </div>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1.5 rounded-lg border border-white/8 hover:border-white/20"
          >
            {showInfo ? 'Ocultar info' : 'Ver info'}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-1 pb-3 flex flex-col gap-3" style={{ minHeight: 0 }}>

          {/* Welcome state */}
          {messages.length === 0 && showInfo && (
            <div className="flex flex-col gap-4 py-2">

              {/* Specialty card */}
              <div
                className="rounded-2xl p-5 border"
                style={{ background: `${agentInfo.agentColor}08`, borderColor: `${agentInfo.agentColor}25` }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: `${agentInfo.agentColor}15` }}
                  >
                    {agentInfo.agentAvatar}
                  </div>
                  <div>
                    <p className="font-display font-bold text-white">Hola, soy {agentInfo.agentName}</p>
                    <p className="text-white/50 text-xs mt-0.5">{definition?.label}</p>
                  </div>
                </div>
                <p className="text-white/65 text-sm leading-relaxed">{agentInfo.specialty}</p>

                {/* Capabilities */}
                <div className="mt-4">
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">Puedo ayudarte con</p>
                  <div className="flex flex-wrap gap-1.5">
                    {agentInfo.capabilities.map(cap => (
                      <span
                        key={cap}
                        className="text-[11px] px-2.5 py-1 rounded-lg border"
                        style={{ background: `${agentInfo.agentColor}10`, borderColor: `${agentInfo.agentColor}25`, color: agentInfo.agentColor }}
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggested questions */}
              <div>
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2 px-1">Preguntas frecuentes</p>
                <div className="grid grid-cols-2 gap-2">
                  {agentInfo.suggestedQuestions.map(q => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-left px-3.5 py-2.5 rounded-xl border border-white/8 bg-white/[0.03] text-white/65 text-xs hover:border-white/20 hover:bg-white/[0.06] hover:text-white transition-all leading-snug"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 mt-0.5"
                  style={{ background: `${agentInfo.agentColor}15`, border: `1px solid ${agentInfo.agentColor}30` }}
                >
                  {agentInfo.agentAvatar}
                </div>
              )}
              <div className={`max-w-[78%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-shark-dark font-medium rounded-tr-sm'
                      : 'bg-white/[0.06] text-white/90 rounded-tl-sm border border-white/8'
                  }`}
                  style={msg.role === 'user' ? { background: agentInfo.agentColor } : {}}
                >
                  {msg.role === 'assistant' ? (
                    <div
                      className="prose-sm"
                      dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
                    />
                  ) : msg.content}
                </div>
                <span className="text-[10px] text-white/25 px-1">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
                style={{ background: `${agentInfo.agentColor}15`, border: `1px solid ${agentInfo.agentColor}30` }}
              >
                {agentInfo.agentAvatar}
              </div>
              <div className="bg-white/[0.06] border border-white/8 px-4 py-3 rounded-2xl rounded-tl-sm">
                <span className="flex gap-1 items-center h-4">
                  {[0, 150, 300].map(d => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: agentInfo.agentColor, animationDelay: `${d}ms`, opacity: 0.7 }}
                    />
                  ))}
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border border-white/8 rounded-2xl p-3 bg-white/[0.02] mt-1">
          {/* Suggested questions mini (after first message) */}
          {messages.length > 0 && messages.length < 4 && (
            <div className="flex gap-2 mb-2.5 overflow-x-auto pb-1 scrollbar-none">
              {agentInfo.suggestedQuestions.slice(0, 4).map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="shrink-0 text-[11px] px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:border-white/25 hover:text-white/80 transition-all whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2.5">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Escribile a ${agentInfo.agentName}...`}
              rows={1}
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none resize-none disabled:opacity-50"
              style={{ maxHeight: '100px' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
              style={{ background: agentInfo.agentColor }}
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#0a1428" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-white/20 mt-2">Enter para enviar · Shift+Enter para nueva línea</p>
        </div>
      </div>

      {/* ── SIDEBAR ── */}
      {showInfo && messages.length > 0 && (
        <div className="w-64 shrink-0 flex flex-col gap-3">

          {/* Agent card */}
          <div
            className="rounded-2xl p-4 border"
            style={{ background: `${agentInfo.agentColor}08`, borderColor: `${agentInfo.agentColor}25` }}
          >
            <div className="text-center mb-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-2"
                style={{ background: `${agentInfo.agentColor}20` }}
              >
                {agentInfo.agentAvatar}
              </div>
              <p className="font-display font-bold text-white text-sm">{agentInfo.agentName}</p>
              <p className="text-white/40 text-xs mt-0.5">{definition?.label}</p>
            </div>
            <p className="text-white/55 text-[11px] leading-relaxed text-center">{agentInfo.specialty}</p>
          </div>

          {/* Capabilities */}
          <div className="border border-white/8 rounded-2xl p-4 bg-white/[0.02]">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Especialidades</p>
            <div className="flex flex-col gap-2">
              {agentInfo.capabilities.map(cap => (
                <div key={cap} className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: agentInfo.agentColor }}
                  />
                  <span className="text-xs text-white/60">{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="border border-white/8 rounded-2xl p-4 bg-white/[0.02]">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Esta sesión</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="font-display font-bold text-xl text-white">{messages.filter(m => m.role === 'user').length}</p>
                <p className="text-[10px] text-white/40">Mensajes</p>
              </div>
              <div className="text-center">
                <p className="font-display font-bold text-xl text-white">{messages.filter(m => m.role === 'assistant').length}</p>
                <p className="text-[10px] text-white/40">Respuestas</p>
              </div>
            </div>
          </div>

          {/* Quick questions */}
          <div className="border border-white/8 rounded-2xl p-4 bg-white/[0.02]">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-3">Preguntas rápidas</p>
            <div className="flex flex-col gap-1.5">
              {agentInfo.suggestedQuestions.slice(0, 4).map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="text-left text-[11px] text-white/50 hover:text-white transition-colors py-1 leading-snug"
                >
                  → {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
