import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_APP_URL,
  timeout: 5000,
  timeoutErrorMessage: 'Timeout error'
})

interface LoginData {
  token: string
}

export type CountriesRates = Record<string, number>
export type InitialCountries = Record<string, string>

type MonthNames =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December'

export type AllRates = {
  [value in MonthNames]: Record<string, number>
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
    const response = await API.get<InitialCountries>('/currencies', config)
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
  times: number
) => {
  try {
    const config = {
      params: {
        base: fromCountry
      },
      headers: {
        authorization: userToken
      }
    }
    const response = await API.get<AllRates[]>(`/historical/${date}/${times.toString()}`, config)
    return response.data
  } catch (e) {
    return {
      error: 'Error'
    }
  }
}

export { login, getCountries, getHistorical }
