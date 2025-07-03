'use client';

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUIStore } from '@/store/uiStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const setToken = useUIStore((state) => state.setToken)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (data?.session?.access_token) {
      setToken(data.session.access_token)
    } else {
      setError(error?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-black bg-gray-50">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <input
        className="border p-2 mb-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        className="border p-2 mb-4"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button className="bg-blue-500 text-white px-4 py-2" onClick={handleLogin}>
        Login
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}
