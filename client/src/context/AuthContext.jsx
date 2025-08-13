// ==== src/context/AuthContext.jsx ====
import { createContext, useContext, useEffect, useState } from 'react'
import http from '../api/http'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export default function AuthProvider({ children }){
  const [user,setUser] = useState(null)
  const [loading,setLoading] = useState(false)
  const login = async (email, password) => {
    setLoading(true)
    try{
      const { data } = await http.post('/auth/login', { email, password, recaptchaToken: 'dev' })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      return data
    } finally{ setLoading(false) }
  }
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }
  useEffect(()=>{
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
  },[])
  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}
