import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { portfolioApi } from '../../api/index.js'

export default function PortfolioDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    portfolioApi.detail(id)
      .then((res) => {
        if (res.code === 200) setItem(res.data)
        else setError('作品未找到')
      })
      .catch(() => setError('无法加载作品详情'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="pt-32 pb-24 px-4">
        <div className="max-w-5xl mx-auto animate-pulse space-y-6">
          <div className="h-4 w-24 bg-white/5 rounded-full" />
          <div className="h-8 w-96 bg-white/5 rounded-full" />
          <div className="h-4 w-64 bg-white/5 rounded-full" />
          <div className="h-64 bg-white/5 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="pt-32 pb-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-white/40 mb-4">{error || '作品未找到'}</p>
          <Link to="/portfolio" className="text-sm text-white/30 hover:text-white/60 transition-colors">← 返回作品集</Link>
        </div>
      </div>
    )
  }

  const images = item.images ? item.images.split(',').filter(Boolean) : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pt-32 pb-24 px-4"
    >
      <div className="max-w-5xl mx-auto">
        <Link to="/portfolio" className="inline-flex items-center text-sm text-white/30 hover:text-white/60 mb-8 transition-colors">
          ← 返回作品集
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{item.title}</h1>
        <p className="text-white/50 mb-8 max-w-2xl leading-relaxed">{item.description}</p>
        {item.demoUrl && (
          <a href={item.demoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all mb-12">
            查看 Demo →
          </a>
        )}
        {images.length > 0 && (
          <div className="grid gap-6">
            {images.map((img, i) => (
              <div key={i} className="rounded-2xl border border-white/5 overflow-hidden bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                <img src={img} alt={`${item.title} ${i + 1}`} className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
