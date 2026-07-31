import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { trackEvent } from '../../utils/tracker.js'

const CHAT_SESSION_KEY = 'jqh_ai_chat_session_id'

function getChatSessionId() {
  const existing = localStorage.getItem(CHAT_SESSION_KEY)
  if (existing) return existing

  const sessionId = window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  localStorage.setItem(CHAT_SESSION_KEY, sessionId)
  return sessionId
}

function AssistantMessage({ content }) {
  return (
    <div className="text-sm text-white/80 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-5">{children}</ol>,
          li: ({ children }) => <li className="pl-1">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          code: ({ children }) => <code className="rounded bg-white/10 px-1 py-0.5 text-[0.92em] text-white/90">{children}</code>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function parseSseEvent(event) {
  const dataLines = event
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).replace(/^ /, ''))

  if (dataLines.length === 0) return null

  const data = dataLines.join('\n')
  if (data === '[DONE]') return null
  return data
}

function appendAssistantChunk(chunk, setMessages) {
  if (!chunk) return
  setMessages((prev) => {
    const updated = [...prev]
    const last = updated[updated.length - 1]
    if (last.role === 'assistant') {
      updated[updated.length - 1] = { ...last, content: last.content + chunk }
    }
    return updated
  })
}

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '你好！我是沁昊の脑洞实验室的 AI 助手，可以回答任何关于沁昊的问题。\n\n你可以试试问：\n- 沁昊会什么技术？\n- 他做过什么项目？\n- 他的技术栈有哪些？' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)
  const abortRef = useRef(null)
  const sessionIdRef = useRef(getChatSessionId())

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setError('')
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    trackEvent('ai_chat_send', {
      pagePath: '/ai-chat',
      targetType: 'ai_chat',
      targetId: sessionIdRef.current,
      metadata: JSON.stringify({ questionLength: userMsg.length }),
    })

    const assistantMsg = { role: 'assistant', content: '' }
    setMessages((prev) => [...prev, assistantMsg])

    try {
      const token = localStorage.getItem('jqh_token')
      const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: userMsg, history, sessionId: sessionIdRef.current }),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let assistantLength = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          buffer += decoder.decode()
          break
        }
        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split(/\r?\n\r?\n/)
        buffer = events.pop() || ''
        for (const event of events) {
          const chunk = parseSseEvent(event)
          assistantLength += chunk?.length || 0
          appendAssistantChunk(chunk, setMessages)
        }
      }

      const finalChunk = parseSseEvent(buffer)
      assistantLength += finalChunk?.length || 0
      appendAssistantChunk(finalChunk, setMessages)
      trackEvent('ai_chat_success', {
        pagePath: '/ai-chat',
        targetType: 'ai_chat',
        targetId: sessionIdRef.current,
        metadata: JSON.stringify({
          questionLength: userMsg.length,
          answerLength: assistantLength,
        }),
      })
    } catch (err) {
      trackEvent('ai_chat_error', {
        pagePath: '/ai-chat',
        targetType: 'ai_chat',
        targetId: sessionIdRef.current,
        metadata: JSON.stringify({ message: err?.message || 'unknown' }),
      })
      setError('连接失败，请确保后端服务已启动')
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last.role === 'assistant' && !last.content) {
          return prev.slice(0, -1)
        }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages])

  return (
    <div className="h-[100dvh] overflow-hidden pt-24 pb-4 px-4 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 min-h-0 flex flex-col">
        <div className="shrink-0 text-center mb-3 sm:mb-6">
          <h1 className="text-3xl font-bold">AI 对话</h1>
          <p className="text-white/30 text-sm mt-1">询问关于沁昊的任何问题</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain mb-4 space-y-4 px-2 pb-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                msg.role === 'user'
                  ? 'bg-indigo-500/20 border border-indigo-500/20'
                  : 'bg-white/5 border border-white/10'
              }`}>
                {msg.role === 'assistant' ? (
                  <AssistantMessage content={msg.content || (loading && i === messages.length - 1 ? '' : msg.content)} />
                ) : (
                  <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                  <span className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                  <span className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && <p className="shrink-0 text-xs text-red-400/80 text-center mb-4">{error}</p>}

        <div className="shrink-0 flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="输入你的问题..."
            disabled={loading}
            className="flex-1 px-5 py-3 rounded-full bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all text-sm disabled:opacity-30"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:opacity-50 transition-all text-sm font-medium"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}
