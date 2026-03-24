import { useState, useRef, useEffect, memo } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { askQuestion } from '../../api/chatAPI'
import axiosInstance from '../../api/axiosInstance'
import { useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

function fixLatex(text) {
  if (!text) return text

  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, inner) => {
    return `$$\n${inner
      .replace(/\u2011/g, '-')
      .replace(/\u2013/g, '-')
      .replace(/\u202F/g, ' ')
      .trim()}\n$$`
  })

  text = text.replace(/\$([^$\n]+?)\$/g, (_, inner) => {
    return `$${inner
      .replace(/\u2011/g, '-')
      .replace(/\u2013/g, '-')
      .replace(/\u202F/g, ' ')
    }$`
  })

  return text
}

const MessageContent = memo(({ content }) => (
  <div className="prose prose-sm max-w-none
                  prose-p:my-1 prose-ul:my-1 prose-ol:my-1
                  prose-li:my-0.5
                  prose-table:text-xs prose-table:w-full
                  prose-th:px-2 prose-th:py-1
                  prose-td:px-2 prose-td:py-1 prose-td:border prose-td:border-white/10
                  dark:prose-invert
                  dark:prose-headings:text-white
                  dark:prose-strong:text-white
                  prose-headings:text-gray-800
                  prose-strong:text-gray-900
                  prose-a:text-primary-500">
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[[rehypeKatex, { output: 'html', throwOnError: false, strict: false, trust: true }]]}
    >
      {fixLatex(content)}
    </ReactMarkdown>
  </div>
))

export default function ChatPage() {
  const { user } = useAuth()

  const [messages, setMessages]                 = useState([])
  const [input, setInput]                       = useState('')
  const [loading, setLoading]                   = useState(false)
  const [conversationId, setConversationId]     = useState(
    () => localStorage.getItem('conversation_id') || null
  )
  const [matieres, setMatieres]                 = useState([])
  const [matieresFiltrees, setMatieresFiltrees] = useState([])
  const [selectedMatiere, setSelectedMatiere]   = useState('')
  const [semestre, setSemestre]                 = useState('')
  const bottomRef = useRef(null)
  const location  = useLocation()

  useEffect(() => {
    if (location.state?.conversation_id) {
      const id = location.state.conversation_id
      setConversationId(id)
      localStorage.setItem('conversation_id', id)
    }
  }, [location])

  useEffect(() => {
    if (conversationId && messages.length === 0) {
      axiosInstance.get(`/chat/messages/${conversationId}`)
        .then(r => setMessages(r.data))
        .catch(() => {})
    }
  }, [conversationId])

  useEffect(() => {
    if (user?.filiere_id && user?.annee_id) {
      axiosInstance.get('/data/matieres', {
        params: { filiere_id: user.filiere_id, annee_id: user.annee_id }
      }).then(r => setMatieres(r.data)).catch(() => {})
    }
  }, [user])

  useEffect(() => {
    if (semestre) {
      setMatieresFiltrees(matieres.filter(m => String(m.semestre) === semestre))
    } else {
      setMatieresFiltrees(matieres)
    }
    setSelectedMatiere('')
  }, [semestre, matieres])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return

    const question = input.trim()
    setInput('')

    setMessages(prev => [...prev, { sender: 'etudiant', contenu: question }])

    setLoading(true)
    try {
      const result = await askQuestion({
        question,
        filiere_id:      user?.filiere_id || '',
        matiere_id:      selectedMatiere,
        conversation_id: conversationId,
      })

      if (!conversationId) {
        setConversationId(result.conversation_id)
        localStorage.setItem('conversation_id', result.conversation_id)
      }

      setMessages(prev => [...prev, {
        sender:  'assistant',
        contenu: result.answer,
        sources: result.sources,
      }])

    } catch {
      setMessages(prev => [...prev, {
        sender:  'assistant',
        contenu: 'Désolé, une erreur est survenue. Réessayez.',
        sources: [],
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function newConversation() {
    setMessages([])
    setConversationId(null)
    localStorage.removeItem('conversation_id')
    setInput('')
  }

  return (
    <div className="animate-fade-up flex flex-col h-[calc(100vh-8rem)]">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="ds-title text-2xl mb-1">Chat IA</h1>
          <p className="ds-muted">Posez vos questions sur vos cours</p>
        </div>
        <button onClick={newConversation} className="ds-btn-outline text-sm">
          + Nouvelle conversation
        </button>
      </div>

      {/* Filtres semestre + matière */}
      <div className="ds-card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="ds-label mb-0 shrink-0 text-xs">Semestre :</label>
            <select value={semestre} onChange={e => setSemestre(e.target.value)}
              className="ds-input max-w-[140px]">
              <option value="">Tous</option>
              <option value="1">Semestre 1</option>
              <option value="2">Semestre 2</option>
            </select>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <label className="ds-label mb-0 shrink-0 text-xs">Matière :</label>
            <select value={selectedMatiere} onChange={e => setSelectedMatiere(e.target.value)}
              className="ds-input max-w-xs">
              <option value="">Toutes les matières</option>
              {matieresFiltrees.map(m => (
                <option key={m._id} value={m._id}>{m.nom}</option>
              ))}
            </select>
          </div>
          {conversationId && (
            <span className="text-xs text-accent-400 ml-auto">✅ Conversation en cours</span>
          )}
        </div>
      </div>

      {/* Zone de messages */}
      <div className="ds-card flex-1 overflow-y-auto p-6 mb-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="ds-title text-xl mb-2">Assistant DeepStudy</h2>
            <p className="ds-muted max-w-sm">
              Posez vos questions sur vos cours et obtenez des réponses
              extraites directement de vos documents pédagogiques.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {[
                'Explique-moi le protocole OSPF',
                'Quelle est la différence entre TCP et UDP ?',
                "C'est quoi le modèle OSI ?",
              ].map(q => (
                <button key={q} onClick={() => setInput(q)}
                  className="text-xs bg-white/5 hover:bg-primary-500/20 text-dark-500
                             hover:text-primary-300 px-3 py-2 rounded-xl transition-all border
                             border-white/5 hover:border-primary-500/30">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'etudiant' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[75%]">
              <div className={`flex items-end gap-2 ${msg.sender === 'etudiant' ? 'flex-row-reverse' : 'flex-row'}`}>

                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0
                  ${msg.sender === 'etudiant'
                    ? 'bg-primary-600 text-white'
                    : 'bg-accent-600/30 text-accent-300'}`}>
                  {msg.sender === 'etudiant' ? '👤' : '🤖'}
                </div>

                {/* Bulle */}
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${msg.sender === 'etudiant'
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-dark-700 dark:text-white/90 text-gray-800 rounded-bl-sm border border-white/5'}`}>

                  {msg.sender === 'etudiant' ? (
                    <p>{msg.contenu}</p>
                  ) : (
                    <MessageContent content={msg.contenu} />
                  )}

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-white/50 mb-1">📄 Sources :</p>
                      {msg.sources.map((s, j) => (
                        <p key={j} className="text-xs text-accent-400">
                          Page {s.page} — {s.file?.split('/').pop()}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-accent-600/30 text-accent-300 flex items-center justify-center text-xs">
                🤖
              </div>
              <div className="bg-dark-700 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 bg-accent-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                  <span className="w-2 h-2 bg-accent-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                  <span className="w-2 h-2 bg-accent-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <div className="ds-card p-3">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question... (Entrée pour envoyer)"
            rows={1}
            className="ds-input flex-1 resize-none min-h-[44px] max-h-32 py-3"
            style={{ height: 'auto' }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="ds-btn-primary px-4 py-3 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ➤
          </button>
        </div>
        <p className="text-xs text-dark-500 mt-2 px-1">Shift+Entrée pour un saut de ligne</p>
      </div>

    </div>
  )
}