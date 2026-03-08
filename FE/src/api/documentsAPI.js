import axiosInstance from './axiosInstance'

export async function listDocuments(filters = {}) {
  const response = await axiosInstance.get('/documents/list', { params: filters })
  return response.data
}

export async function uploadDocument(formData) {
  const response = await axiosInstance.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function deleteDocument(docId) {
  const response = await axiosInstance.delete(`/documents/${docId}`)
  return response.data
}