import axiosInstance from './axiosInstance'

export async function askQuestion({ question, filiere_id, matiere_id, conversation_id }) {
  const response = await axiosInstance.post('/chat/ask', {
    question,
    filiere_id,
    matiere_id,
    conversation_id,
  })
  return response.data
}

export async function getChatHistory() {
  const response = await axiosInstance.get('/chat/history')
  return response.data
}