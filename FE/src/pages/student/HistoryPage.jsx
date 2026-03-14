import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getChatHistory } from '../../api/chatAPI'
import { formatDate } from '../../utils/formatters'
import axiosInstance from '../../api/axiosInstance'

export default function HistoryPage() {
  const navigate = useNavigate()

  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv]   = useState(null)
  const [messages, setMessages]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)

  // Charger les conversations
  useEffect(() => {
    getChatHistory()
      .then(data => setConversations(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Charger les messages d'une conversation
  async function loadMessages(conv) {
    setSelectedConv(conv)
    setLoadingMessages(true)
    try {
      const response = await axiosInstance.get(`/chat/messages/${conv._id}`)
      setMessages(response.data)
    } catch {
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  function continueConversation(conv) {
    navigate('/student/chat', { state: { conversation_id: conv._id } })
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="ds-title text-2xl mb-1">Historique</h1>
        <p className="ds-muted">Vos sessions de révision passées</p>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && conversations.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">💬</p>
          <p className="ds-title text-lg mb-2">Aucune conversation</p>
          <p className="ds-muted mb-6">Vous n'avez pas encore posé de questions.</p>
          <button onClick={() => navigate('/student/chat')}
            className="ds-btn-primary">
            Démarrer une conversation
          </button>
        </div>
      )}

      {!loading && conversations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Liste des conversations */}
          <div className="lg:col-span-1 space-y-3">
            <p className="ds-muted text-sm mb-3">{conversations.length} conversation(s)</p>
            {conversations.map(conv => (
              <div
                key={conv._id}
                onClick={() => loadMessages(conv)}
                className={`ds-card p-4 cursor-pointer transition-all duration-200 hover:border-primary-500/30
                  ${selectedConv?._id === conv._id
                    ? 'border-primary-500/50 bg-primary-600/10'
                    : 'hover:shadow-glow'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate mb-1">
                      💬 {conv.titre || 'Conversation'}
                    </p>
                    <p className="text-xs text-dark-500">
                      {formatDate(conv.created_at)}
                    </p>
                  </div>
                  {selectedConv?._id === conv._id && (
                    <span className="w-2 h-2 rounded-full bg-primary-400 shrink-0 mt-1.5" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Détail de la conversation */}
          <div className="lg:col-span-2 ds-card p-6 flex flex-col">
            {!selectedConv ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                <p className="text-4xl mb-4">👈</p>
                <p className="ds-muted">Sélectionnez une conversation pour voir les messages</p>
              </div>
            ) : (
              <>
                {/* Header conversation */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <div>
                    <h2 className="ds-title text-lg">{selectedConv.titre || 'Conversation'}</h2>
                    <p className="ds-muted text-xs">{formatDate(selectedConv.created_at)}</p>
                  </div>
                  <button
                    onClick={() => continueConversation(selectedConv)}
                    className="ds-btn-primary text-sm">
                    ▶ Continuer
                  </button>
                </div>

                {/* Messages */}
                {loadingMessages ? (
                  <div className="flex justify-center py-10">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="ds-muted text-center py-10">Aucun message dans cette conversation.</p>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-4 max-h-[500px] pr-2">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === 'etudiant' ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[75%]">
                          <div className={`flex items-end gap-2 ${msg.sender === 'etudiant' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0
                              ${msg.sender === 'etudiant'
                                ? 'bg-primary-600 text-white'
                                : 'bg-accent-600/30 text-accent-300'}`}>
                              {msg.sender === 'etudiant' ? '👤' : '🤖'}
                            </div>
                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
                              ${msg.sender === 'etudiant'
                                ? 'bg-primary-600 text-white rounded-br-sm'
                                : 'bg-dark-700 text-white/90 rounded-bl-sm border border-white/5'}`}>
                              {msg.contenu}
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
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      )}
    </div>
  )
}