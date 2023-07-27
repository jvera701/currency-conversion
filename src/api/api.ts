import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000,
  timeoutErrorMessage: 'Timeout error'
})

const login = async (email: string, password: string) => {
  try {
    const response = await API.post('/login', { email: email, password: password })
    return response.data
  } catch (e) {
    return {
      error: 'Error'
    }
  }
}

export { login }
