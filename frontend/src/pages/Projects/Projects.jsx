import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { projectApi } from '../../api/index.js'
import useAuthStore from '../../stores/authStore.js'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] } },
}

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const user = useAuthStore((s) => s.user)

  const load = () => {
    setLoading(true)
    projectApi.list()
      .then((res) => { if (res.code === 200) setProjects(res.data) })
      .catch(() => setError('无法加载项目数据'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id, title) => {
    if (!window.confirm(`确定删除「${title}」？`)) return
    try {
      await projectApi.remove(id)
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
          <div className="h-4 w-64 bg-white/5 rounded-full mx-auto mb-16" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-white/5 rounded-[1.5rem]" />
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">项目经验</h1>
          <p className="text-white/40 max-w-md mx-auto mb-6">每一个项目都是一次成长的践踩</p>
          {user?.role === 'admin' && (
            <Link to="/projects/new" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-sm font-medium transition-all">
              + 添加项目
            </Link>
          )}
        </motion.div>

        {error && <p className="text-xs text-red-400/80 text-center mb-8">{error}</p>}

        {projects.length === 0 && !loading ? (
          <p className="text-white/20 text-center">暂无项目数据</p>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects.map((p) => (
              <motion.div key={p.id} variants={itemVariants} whileHover={{ y: -6 }} className="group relative">
                <div className="p-[1px] rounded-[1.5rem] bg-gradient-to-b from-white/10 to-transparent hover:from-white/20 transition-all duration-500 h-full">
                  <div className="rounded-[1.5rem] bg-[#0a0a0a] p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-white/90">{p.title}</h3>
                      {p.isFeatured && <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300/70 shrink-0">精选</span>}
                    </div>
                    <p className="text-sm text-white/40 mb-4 flex-1 leading-relaxed">{p.description}</p>
                    {p.techStack && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {p.techStack.split(',').map((t) => (
                          <span key={t.trim()} className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/40">{t.trim()}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-3 mt-auto">
                      {p.githubUrl && (
                        <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-white/30 hover:text-white/60 transition-colors">GitHub →</a>
                      )}
                      {p.demoUrl && (
                        <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400/60 hover:text-indigo-400 transition-colors">Demo →</a>
                      )}
                    </div>
                    {user?.role === 'admin' && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                        <Link to={`/projects/edit/${p.id}`} className="text-xs text-white/30 hover:text-white/60 transition-colors">编辑</Link>
                        <button onClick={() => handleDelete(p.id, p.title)} className="text-xs text-red-400/50 hover:text-red-400 transition-colors">删除</button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
