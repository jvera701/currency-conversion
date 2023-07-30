import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_APP_URL,
  timeout: 5000,
  timeoutErrorMessage: 'Timeout error'
})

interface LoginData {
  token: string
}

export type AllCountriesData = Record<string, number>

interface LatestConversionData {
  rates: AllCountriesData
}

const login = async (email: string, password: string) => {
  try {
    const response = await API.post<LoginData>('/login', { email: email, password: password })
    return response.data
  } catch (e) {
    return {
      error: 'Error'
    }
  }
}

const getCountries = async (userToken: string) => {
  try {
    const config = {
      headers: {
        authorization: userToken
      }
    }
    const response = await API.get<AllCountriesData>('/currencies', config)
    return response.data
  } catch (e) {
    return {
      error: 'Error'
    }
  }
}

const getLatestConversion = async (userToken: string, country: string) => {
  try {
    const config = {
      params: {
        base: country
      },
      headers: {
        authorization: userToken
      }
    }
    const response = await API.get<LatestConversionData>('/latest', config)
    return response.data
  } catch (e) {
    return {
      error: 'Error'
    }
  }
}

const getHistorical = async (
  userToken: string,
  date: string,
  fromCountry: string,
  toCountry: string
) => {
  try {
    const config = {
      params: {
        base: fromCountry,
        symbol: toCountry
      },
      headers: {
        authorization: userToken
      }
    }
    const response = await API.get<LatestConversionData>(`/historical/${date}`, config)
    return response.data
  } catch (e) {
    return {
      error: 'Error'
    }
  }
}

export { login, getCountries, getLatestConversion, getHistorical }
