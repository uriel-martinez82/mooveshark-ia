'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

export function ChatInterface({ agentId, agentName }: { agentId: string; agentName: string }) {
  const [messages, setMessages]             = useState<Message[]>([])
  const [input, setInput]                   = useState('')
  const [loading, setLoading]               = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input.trim(), id: Date.now().toString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: userMsg.content, agentId, conversationId }),
      })

      const data = await res.json()

      if (data.success) {
        setMessages(prev => [...prev, {
          role:    'assistant',
          content: data.data.response,
          id:      (Date.now() + 1).toString(),
        }])
        if (data.data.conversationId) setConversationId(data.data.conversationId)
      } else {
        setMessages(prev => [...prev, {
          role:    'assistant',
          content: 'Hubo un error al procesar tu mensaje. Intentá de nuevo.',
          id:      (Date.now() + 1).toString(),
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: 'Hubo un error de conexión. Intentá de nuevo.',
        id:      (Date.now() + 1).toString(),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col flex-1 card-dark rounded-2xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4" style={{ minHeight: 0 }}>
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <div className="w-12 h-12 rounded-xl bg-shark-cyan/10 border border-shark-cyan/20 flex items-center justify-center text-2xl mb-4">🦈</div>
            <p className="text-white font-medium mb-1">Hola, soy {agentName}</p>
            <p className="text-white/40 text-sm">¿En qué puedo ayudarte hoy?</p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-shark-cyan/10 border border-shark-cyan/20 flex items-center justify-center text-sm mr-2 mt-1 shrink-0">
                🦈
              </div>
            )}
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-shark-cyan text-shark-dark font-medium rounded-tr-sm'
                : 'bg-white/[0.06] text-white/85 rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-lg bg-shark-cyan/10 border border-shark-cyan/20 flex items-center justify-center text-sm mr-2 mt-1 shrink-0">🦈</div>
            <div className="bg-white/[0.06] px-4 py-3 rounded-2xl rounded-tl-sm">
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/8 p-4">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escribí tu mensaje..."
            rows={1}
            disabled={loading}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-shark-cyan/40 resize-none transition-colors disabled:opacity-50"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-shark-cyan text-shark-dark flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-opacity-90 transition-all"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-white/20 mt-2 text-center">Enter para enviar · Shift+Enter para nueva línea</p>
      </div>
    </div>
  )
}