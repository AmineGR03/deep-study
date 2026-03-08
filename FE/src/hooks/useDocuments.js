import { useState, useEffect } from 'react'
import { listDocuments } from '../api/documentsAPI'

export function useDocuments(filters = {}) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    listDocuments(filters)
      .then(data => setDocuments(data))
      .catch(() => setError('Erreur lors du chargement des documents'))
      .finally(() => setLoading(false))
  }, [JSON.stringify(filters)])

  return { documents, loading, error }
}