import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useAuthStore from '../../stores/authStore.js'

const navLinks = [
  { path: '/', label: '首页' },
  { path: '/projects', label: '项目经验' },
  { path: '/portfolio', label: '作品集' },
  { path: '/ai-chat', label: 'AI 对话' },
  { path: '/blog', label: '博客' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuthStore()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-2xl rounded-full px-6 py-3 border border-white/10 shadow-2xl">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="text-2xl">🧠</span>
            <span className="hidden sm:inline bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              沁昊の脑洞实验室
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                  location.pathname === link.path
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <>
                <Link to="/editor" className="px-4 py-2 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300">
                  写文章
                </Link>
                <Link to="/knowledge" className="px-4 py-2 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300">
                  知识库
                </Link>
                <Link to="/dashboard" className="px-4 py-2 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all duration-300">
                  仪表盘
                </Link>
              </>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={logout}
                className="text-xs text-white/40 hover:text-white/80 transition-colors"
              >
                {user.role === 'admin' ? '退出' : '访客模式'}
              </button>
            ) : (
              <Link
                to="/login"
                className="text-xs px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all"
              >
                登录
              </Link>
            )}
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2"
            >
              <span className={`block w-5 h-[1.5px] bg-white/60 transition-all ${
                menuOpen ? 'rotate-45 translate-y-[4.5px]' : ''
              }`} />
              <span className={`block w-5 h-[1.5px] bg-white/60 transition-all ${
                menuOpen ? 'opacity-0' : ''
              }`} />
              <span className={`block w-5 h-[1.5px] bg-white/60 transition-all ${
                menuOpen ? '-rotate-45 -translate-y-[4.5px]' : ''
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 top-0 bg-black/90 backdrop-blur-3xl z-40 flex flex-col items-center justify-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className="text-2xl text-white/80 hover:text-white transition-all"
            >
              {link.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <>
              <Link to="/editor" onClick={() => setMenuOpen(false)} className="text-2xl text-white/80 hover:text-white">写文章</Link>
              <Link to="/knowledge" onClick={() => setMenuOpen(false)} className="text-2xl text-white/80 hover:text-white">知识库</Link>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-2xl text-white/80 hover:text-white">仪表盘</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
