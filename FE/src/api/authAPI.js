import axiosInstance from './axiosInstance'

export async function login(email, password) {
  const response = await axiosInstance.post('/auth/login', { email, password })
  return response.data
}

export async function register({ nom, prenom, email, password, role, filiere_id, annee_id, specialite_id }) {
  const response = await axiosInstance.post('/auth/register', {
    nom, prenom, email, password, role, filiere_id, annee_id, specialite_id,
  })
  return response.data
}