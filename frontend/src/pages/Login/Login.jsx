import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '../../stores/authStore.js'
import { authApi } from '../../api/index.js'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, guestLogin } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authApi.login({ username, password })
      if (res.code === 200) {
        login(res.data.token)
        navigate('/')
      } else {
        setError(res.message || '登录失败')
      }
    } catch (err) {
      setError(err?.message || '后端服务不可用，请先使用访客登录')
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = () => {
    guestLogin()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🧠</div>
          <h1 className="text-2xl font-bold">欢迎回来</h1>
          <p className="text-white/40 text-sm mt-2">登录沁昊の脑洞实验室</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="用户名"
            className="w-full px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密码"
            className="w-full px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all"
          />
          {error && (
            <p className="text-xs text-red-400/80 text-center">{error}</p>
          )}
          <motion.button
            type="submit"
            disabled={loading || !username || !password}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:opacity-30 text-sm font-medium transition-all"
          >
            {loading ? '登录中...' : '登录'}
          </motion.button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#050505] px-4 text-xs text-white/20">或者</span>
          </div>
        </div>

        <motion.button
          onClick={handleGuest}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all"
        >
          访客浏览
        </motion.button>
      </motion.div>
    </div>
  )
}
