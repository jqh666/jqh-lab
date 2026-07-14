import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { blogApi } from '../../api/index.js'

export default function BlogDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    blogApi.detail(id)
      .then((res) => {
        if (res.code === 200) setPost(res.data)
        else setError('文章未找到')
      })
      .catch(() => setError('无法加载文章'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="pt-32 pb-24 px-4">
        <div className="max-w-3xl mx-auto animate-pulse space-y-6">
          <div className="h-4 w-24 bg-white/5 rounded-full" />
          <div className="h-8 w-full bg-white/5 rounded-full" />
          <div className="h-4 w-48 bg-white/5 rounded-full" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-white/5 rounded-full" style={{ width: `${60 + Math.random() * 40}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="pt-32 pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/40 mb-4">{error || '文章未找到'}</p>
          <Link to="/blog" className="text-sm text-white/30 hover:text-white/60 transition-colors">← 返回博客</Link>
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
      <div className="max-w-3xl mx-auto">
        <Link to="/blog" className="inline-flex items-center text-sm text-white/30 hover:text-white/60 mb-8 transition-colors">
          ← 返回博客
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/40">
            {post.categoryId || '未分类'}
          </span>
          <span className="text-xs text-white/20">{post.createdAt?.split('T')[0]}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-8">{post.title}</h1>
        <div className="prose prose-invert max-w-none text-white/70 leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {post.contentMd || ''}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  )
}
