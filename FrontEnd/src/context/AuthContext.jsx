import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import api from '../services/api'

const AuthContext =
  createContext(null)

// --------------------------------------------------
// Prevent duplicate auth requests during development
// --------------------------------------------------

let authCheckPromise = null

async function checkAuthenticatedUser() {
  if (authCheckPromise) {
    return authCheckPromise
  }

  authCheckPromise =
    api.get('/auth/me')
      .then((response) => {
        return response.data.data
      })
      .finally(() => {
        authCheckPromise = null
      })

  return authCheckPromise
}

// --------------------------------------------------
// Provider
// --------------------------------------------------

export function AuthProvider({
  children,
}) {
  const [
    user,
    setUser,
  ] = useState(null)

  const [
    loading,
    setLoading,
  ] = useState(true)

  // ------------------------------------------------
  // Restore authenticated user
  // ------------------------------------------------

  useEffect(() => {
    const token =
      localStorage.getItem(
        'token'
      )

    if (!token) {
      setLoading(false)
      return
    }

    const getUser =
      async () => {
        try {
          const data =
            await checkAuthenticatedUser()

          setUser(data)

          /*
           * Keep localStorage user synchronized
           * with the server response.
           */
          localStorage.setItem(
            'user',
            JSON.stringify(data)
          )
        } catch (error) {
          console.error(
            'Auth check error:',
            error.response?.data ||
              error
          )

          localStorage.removeItem(
            'token'
          )

          localStorage.removeItem(
            'user'
          )

          setUser(null)
        } finally {
          setLoading(false)
        }
      }

    getUser()
  }, [])

  // ------------------------------------------------
  // Login
  // ------------------------------------------------

  const login = (
    token,
    userData
  ) => {
    localStorage.setItem(
      'token',
      token
    )

    localStorage.setItem(
      'user',
      JSON.stringify(
        userData
      )
    )

    setUser(userData)
  }

  // ------------------------------------------------
  // Logout
  // ------------------------------------------------

  const logout = () => {
    localStorage.removeItem(
      'token'
    )

    localStorage.removeItem(
      'user'
    )

    setUser(null)

    /*
     * Invalidate any cached auth request.
     */
    authCheckPromise = null
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// --------------------------------------------------
// Hook
// --------------------------------------------------

export function useAuth() {
  return useContext(
    AuthContext
  )
}