import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',

  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('token')

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`
    }

    /*
     * Let Axios/browser set the correct
     * Content-Type automatically.
     *
     * JSON requests will use the normal
     * Axios behavior.
     *
     * FormData requests will automatically
     * become multipart/form-data with the
     * required boundary.
     */
    if (
      config.data instanceof FormData
    ) {
      delete config.headers[
        'Content-Type'
      ]
    }

    return config
  },
  (error) =>
    Promise.reject(error)
)

export default api