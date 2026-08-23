import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setLoading(true)

    try {
      const response = await api.post(
        '/auth/login',
        {
          email: email.trim(),
          password,
        }
      )

      const {
        token,
        user,
      } = response.data.data

      login(
        token,
        user
      )

      navigate('/dashboard')
    } catch (error) {
      console.error(
        'Login error:',
        error.response?.data || error
      )

      setError(
        error.response?.data?.message ||
          'Login failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Mu'amalati
        </h1>

        <p className="mb-6 text-gray-500">
          Sign in to your account
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Email */}

          <div>
            <label
              htmlFor="login-email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
              placeholder="admin@company.test"
            />
          </div>

          {/* Password */}

          <div>
            <label
              htmlFor="login-password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="login-password"
              name="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Signing in...'
              : 'Sign In'}
          </button>

        </form>

      </div>

    </div>
  )
}

export default Login