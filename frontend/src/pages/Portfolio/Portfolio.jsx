import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { portfolioApi } from '../../api/index.js'
import useAuthStore from '../../stores/authStore.js'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] } },
}

export default function Portfolio() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const user = useAuthStore((s) => s.user)

  const load = () => {
    setLoading(true)
    portfolioApi.list()
      .then((res) => { if (res.code === 200) setItems(res.data) })
      .catch(() => setError('无法加载作品集'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id, title) => {
    if (!window.confirm(`确定删除「${title}」？`)) return
    try {
      await portfolioApi.remove(id)
      load()
    } catch {
      setError('删除失败')
    }
  }

  if (loading) {
    return (
      <div className="pt-32 pb-24 px-4">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-8 w-48 bg-white/5 rounded-full mx-auto mb-4" />
          <div className="h-4 w-32 bg-white/5 rounded-full mx-auto mb-16" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white/5 rounded-[1.5rem]" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">作品集</h1>
          <p className="text-white/40 max-w-md mx-auto mb-6">让作品说话</p>
          {user?.role === 'admin' && (
            <Link to="/portfolio/new" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-sm font-medium transition-all">
              + 添加作品
            </Link>
          )}
        </motion.div>

        {error && <p className="text-xs text-red-400/80 text-center mb-8">{error}</p>}

        {items.length === 0 ? (
          <p className="text-white/20 text-center">暂无作品</p>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.map((item) => (
              <motion.div key={item.id} variants={itemVariants} whileHover={{ y: -6 }} className="group relative">
                <Link to={`/portfolio/${item.id}`} className="block relative p-[1px] rounded-[1.5rem] bg-gradient-to-b from-white/10 to-transparent hover:from-white/20 transition-all duration-500 h-full">
                  <div className="rounded-[1.5rem] bg-[#0a0a0a] overflow-hidden h-full">
                    <div className="aspect-video bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-4xl text-white/20">
                      🎨
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-medium text-white/80 group-hover:text-white transition-colors">{item.title}</h3>
                      <p className="text-xs text-white/30 mt-1">{item.description}</p>
                    </div>
                  </div>
                </Link>
                {user?.role === 'admin' && (
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/portfolio/edit/${item.id}`} className="text-[11px] px-3 py-1 rounded-full bg-black/80 backdrop-blur-sm text-white/60 hover:text-white border border-white/10 transition-all">编辑</Link>
                    <button onClick={() => handleDelete(item.id, item.title)} className="text-[11px] px-3 py-1 rounded-full bg-black/80 backdrop-blur-sm text-red-400/60 hover:text-red-400 border border-white/10 transition-all">删除</button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
