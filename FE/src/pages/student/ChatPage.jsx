import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { askQuestion } from '../../api/chatAPI'
import axiosInstance from '../../api/axiosInstance'

export default function ChatPage() {
  const { user } = useAuth()

  const [messages, setMessages]       = useState([])
  const [input, setInput]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [matieres, setMatieres]       = useState([])
  const [selectedMatiere, setSelectedMatiere] = useState('')
  const bottomRef = useRef(null)

  // Charger les matières de l'étudiant
  useEffect(() => {
    if (user?.filiere_id) {
      axiosInstance.get('/data/matieres', {
        params: { filiere_id: user.filiere_id }
      }).then(r => setMatieres(r.data)).catch(() => {})
    }
  }, [user])

  // Auto-scroll vers le bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return

    const question = input.trim()
    setInput('')

    // Ajouter le message de l'étudiant immédiatement
    setMessages(prev => [...prev, {
      sender: 'etudiant',
      contenu: question,
    }])

    setLoading(true)
    try {
      const result = await askQuestion({
        question,
        filiere_id:      user?.filiere_id || '',
        matiere_id:      selectedMatiere,
        conversation_id: conversationId,
      })

      // Sauvegarder l'ID de conversation pour la suite
      if (!conversationId) setConversationId(result.conversation_id)

      // Ajouter la réponse de l'assistant
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

      {/* Filtre matière */}
      <div className="ds-card p-4 mb-4">
        <div className="flex items-center gap-4">
          <label className="ds-label mb-0 shrink-0">Filtrer par matière :</label>
          <select value={selectedMatiere} onChange={e => setSelectedMatiere(e.target.value)}
            className="ds-input max-w-xs">
            <option value="">Toutes les matières</option>
            {matieres.map(m => (
              <option key={m._id} value={m._id}>{m.nom}</option>
            ))}
          </select>
          {conversationId && (
            <span className="text-xs text-accent-400 ml-auto">
              ✅ Conversation en cours
            </span>
          )}
        </div>
      </div>

      {/* Zone de messages */}
      <div className="ds-card flex-1 overflow-y-auto p-6 mb-4 space-y-4">

        {/* Message de bienvenue */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="ds-title text-xl mb-2">Assistant DeepStudy</h2>
            <p className="ds-muted max-w-sm">
              Posez vos questions sur vos cours et obtenez des réponses 
              extraites directement de vos documents pédagogiques.
            </p>
            {/* Questions suggérées */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {[
                'Explique-moi le protocole OSPF',
                'Quelle est la différence entre TCP et UDP ?',
                'C\'est quoi le modèle OSI ?',
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

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'etudiant' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] ${msg.sender === 'etudiant' ? 'order-2' : 'order-1'}`}>

              {/* Avatar */}
              <div className={`flex items-end gap-2 ${msg.sender === 'etudiant' ? 'flex-row-reverse' : 'flex-row'}`}>
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
                    : 'bg-dark-700 text-white/90 rounded-bl-sm border border-white/5'}`}>
                  {msg.contenu}

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

        {/* Indicateur de chargement */}
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
        <p className="text-xs text-dark-500 mt-2 px-1">
          Shift+Entrée pour un saut de ligne
        </p>
      </div>

    </div>
  )
}