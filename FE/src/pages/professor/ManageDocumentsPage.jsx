import { useState, useEffect } from 'react'
import { uploadDocument } from '../../api/documentsAPI'
import axiosInstance from '../../api/axiosInstance'

const TYPES = ['COURS', 'TP', 'EXAM', 'RESUME']

export default function ManageDocumentsPage() {
  const [form, setForm] = useState({
    titre: '', filiere_id: '', annee_id: '',
    matiere_id: '', type: 'COURS',
  })
  const [file, setFile]               = useState(null)
  const [uploading, setUploading]     = useState(false)
  const [uploadMsg, setUploadMsg]     = useState('')
  const [uploadError, setUploadError] = useState('')

  const [filieres, setFilieres] = useState([])
  const [annees, setAnnees]     = useState([])
  const [matieres, setMatieres] = useState([])

  useEffect(() => {
    axiosInstance.get('/data/filieres').then(r => setFilieres(r.data)).catch(() => {})
    axiosInstance.get('/data/annees').then(r => setAnnees(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (form.filiere_id) {
      axiosInstance.get('/data/matieres', {
        params: {
          filiere_id: form.filiere_id,
          ...(form.annee_id ? { annee_id: form.annee_id } : {})
        }
      }).then(r => setMatieres(r.data)).catch(() => {})
    } else {
      setMatieres([])
    }
  }, [form.filiere_id, form.annee_id])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'filiere_id' ? { matiere_id: '', annee_id: '' } : {}),
      ...(name === 'annee_id'   ? { matiere_id: '' } : {}),
    }))
  }

  async function handleUpload(e) {
    e.preventDefault()
    setUploadMsg('')
    setUploadError('')

    if (!file) { setUploadError('Veuillez sélectionner un fichier'); return }

    const formData = new FormData()
    formData.append('file',       file)
    formData.append('titre',      form.titre || file.name)
    formData.append('filiere_id', form.filiere_id)
    formData.append('annee_id',   form.annee_id)
    formData.append('matiere_id', form.matiere_id)
    formData.append('type',       form.type)

    setUploading(true)
    try {
      const result = await uploadDocument(formData)
      setUploadMsg(`✅ Document uploadé — ${result.chunks_indexes} chunks indexés`)
      setForm({ titre: '', filiere_id: '', annee_id: '', matiere_id: '', type: 'COURS' })
      setFile(null)
      document.getElementById('file-input').value = ''
    } catch (err) {
      setUploadError(err.response?.data?.error || "Erreur lors de l'upload")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="animate-fade-up max-w-2xl">
      <div className="mb-8">
        <h1 className="ds-title text-2xl mb-1">Uploader un document</h1>
        <p className="ds-muted">Ajoutez une ressource pédagogique — elle sera indexée automatiquement</p>
      </div>

      <div className="ds-card p-6">

        {uploadMsg && (
          <div className="bg-accent-500/10 border border-accent-500/30 text-accent-300 text-sm px-4 py-3 rounded-xl mb-5">
            {uploadMsg}
          </div>
        )}
        {uploadError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
            {uploadError}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="ds-label">Titre du document</label>
            <input name="titre" value={form.titre} onChange={handleChange}
              placeholder="Ex: Cours Réseaux Chapitre 3" className="ds-input" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="ds-label">Filière</label>
              <select name="filiere_id" value={form.filiere_id}
                onChange={handleChange} className="ds-input" required>
                <option value="">-- Choisir --</option>
                {filieres.map(f => (
                  <option key={f._id} value={f._id}>{f.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="ds-label">Année</label>
              <select name="annee_id" value={form.annee_id}
                onChange={handleChange} className="ds-input" required>
                <option value="">-- Choisir --</option>
                {annees.map(a => (
                  <option key={a._id} value={a._id}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="ds-label">Matière</label>
              <select name="matiere_id" value={form.matiere_id}
                onChange={handleChange} className="ds-input">
                <option value="">-- Choisir --</option>
                {matieres.map(m => (
                  <option key={m._id} value={m._id}>{m.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="ds-label">Type</label>
              <select name="type" value={form.type}
                onChange={handleChange} className="ds-input" required>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="ds-label">Fichier (PDF, DOCX, PPTX, TXT)</label>
            <input id="file-input" type="file"
              accept=".pdf,.docx,.pptx,.txt"
              onChange={e => setFile(e.target.files[0])}
              className="ds-input py-2 file:mr-3 file:py-1 file:px-3 file:rounded-lg
                         file:border-0 file:bg-primary-600/30 file:text-primary-300
                         file:text-xs file:cursor-pointer cursor-pointer"
              required />
            {file && (
              <p className="text-xs text-accent-400 mt-1">
                ✅ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} Mo)
              </p>
            )}
          </div>

          <button type="submit" disabled={uploading}
            className="ds-btn-primary flex items-center gap-2">
            {uploading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Indexation en cours...</>
              : '📤 Uploader et indexer'}
          </button>
        </form>
      </div>
    </div>
  )
}