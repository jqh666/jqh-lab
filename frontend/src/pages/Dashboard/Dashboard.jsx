import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { dashboardApi } from '../../api/index.js'

export default function Dashboard() {
  const [stats, setStats] = useState({ blogCount: 0, projectCount: 0, portfolioCount: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardApi.stats()
      .then((res) => { if (res.code === 200) setStats(res.data) })
      .catch((err) => setError('无法加载统计数据'))
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: '博客文章', value: stats.blogCount, icon: '📝', color: 'from-indigo-500/20 to-transparent' },
    { label: '项目经验', value: stats.projectCount, icon: '💼', color: 'from-purple-500/20 to-transparent' },
    { label: '作品集', value: stats.portfolioCount, icon: '🎨', color: 'from-pink-500/20 to-transparent' },
    { label: 'AI 对话次数', value: 0, icon: '🤖', color: 'from-cyan-500/20 to-transparent' },
  ]

  if (loading) {
    return (
      <div className="pt-32 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-white/5 rounded-full" />
            <div className="h-4 w-32 bg-white/5 rounded-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-white/5 rounded-[1.5rem]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-32 pb-24 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">仪表盘</h1>
        <p className="text-white/30 mb-12">你的内容数据概览</p>
        {error && <p className="text-xs text-red-400/80 mb-4">{error}</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative p-[1px] rounded-[1.5rem] bg-gradient-to-b from-white/10 to-transparent"
            >
              <div className={`rounded-[1.5rem] bg-[#0a0a0a] p-6 bg-gradient-to-br ${card.color}`}>
                <div className="text-3xl mb-3">{card.icon}</div>
                <div className="text-3xl font-bold text-white mb-1">{card.value}</div>
                <div className="text-sm text-white/40">{card.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
