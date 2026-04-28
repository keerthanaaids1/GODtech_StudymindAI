import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:8000' })

export const getNotebooks = () => API.get('/notebooks')
export const createNotebook = (name) => API.post(`/notebook/create?name=${encodeURIComponent(name)}`)
export const deleteNotebook = (id) => API.delete(`/notebook/${id}`)
export const uploadFile = (notebookId, file) => {
  const form = new FormData()
  form.append('file', file)
  return API.post(`/upload/${notebookId}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export const chat = (notebookId, message) =>
  API.post('/chat', { notebook_id: notebookId, message })
export const generate = (notebookId, type) =>
  API.post('/generate', { notebook_id: notebookId, type })
