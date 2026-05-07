import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getAssistants = () => api.get('/assistants').then(res => res.data);

// Medical Documents
export const uploadMedicalDocument = (formData) => api.post('/documents/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const getPatientDocuments = (patientId) => api.get(`/documents/patient/${patientId}`).then(res => res.data);

export const deleteMedicalDocument = (docId) => api.delete(`/documents/${docId}`);

export default api;
