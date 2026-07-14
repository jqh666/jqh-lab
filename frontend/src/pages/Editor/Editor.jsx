import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { blogApi } from '../../api/index.js'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Editor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [content, setContent] = useState('')
  const [categories, setCategories] = useState([])
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    blogApi.categories()
      .then((res) => { if (res.code === 200 && res.data.length > 0) { setCategories(res.data); if (!categoryId) setCategoryId(res.data[0].id) } })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    blogApi.detail(id)
      .then((res) => {
        if (res.code === 200) {
          setTitle(res.data.title || '')
          setCategoryId(res.data.categoryId || null)
          setContent(res.data.contentMd || '')
        }
      })
      .catch(() => setError('无法加载文章'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) return
    setPublishing(true)
    setError('')
    try {
      const data = { title: title.trim(), contentMd: content.trim(), categoryId, status: 'published' }
      if (isEdit) {
        await blogApi.update(id, data)
      } else {
        await blogApi.create(data)
      }
      navigate('/blog')
    } catch (err) {
      setError(err?.message || '发布失败，请重试')
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="pt-28 pb-24 px-4">
        <div className="max-w-6xl mx-auto animate-pulse space-y-6">
          <div className="h-8 w-64 bg-white/5 rounded-full" />
          <div className="h-64 bg-white/5 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex-1">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="文章标题..."
              className="w-full bg-transparent text-3xl font-bold text-white placeholder-white/20 focus:outline-none"
            />
          </div>
          <button
            onClick={handlePublish}
            disabled={publishing || !title.trim() || !content.trim()}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:opacity-30 transition-all text-sm font-medium shrink-0 ml-4"
          >
            {publishing ? '发布中...' : (isEdit ? '更新' : '发布')}
          </button>
        </div>

        {error && <p className="text-xs text-red-400/80 mb-4">{error}</p>}

        <div className="flex gap-3 mb-6 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryId(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs transition-all ${
                categoryId === cat.id ? 'bg-white/15 text-white' : 'bg-white/5 text-white/40 hover:text-white/60'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 h-[60vh]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="用 Markdown 写你的文章..."
            className="w-full h-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/30 transition-all resize-none font-mono"
          />
          <div className="w-full h-full bg-white/5 border border-white/10 rounded-2xl p-6 overflow-y-auto">
            <div className="prose prose-invert text-sm text-white/60">
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              ) : (
                '预览区域'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
