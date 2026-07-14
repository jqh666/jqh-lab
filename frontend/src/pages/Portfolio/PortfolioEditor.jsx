import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { portfolioApi, uploadApi } from '../../api/index.js'
import ImageUploader from '../../components/ImageUploader.jsx'

export default function PortfolioEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({ title: '', description: '', images: [], demoUrl: '', category: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    portfolioApi.detail(id)
      .then((res) => {
        if (res.code !== 200) return
        const item = res.data
        const urls = item.images ? item.images.split(',').filter(Boolean) : []
        setForm((prev) => ({
          ...prev,
          title: item.title || '',
          description: item.description || '',
          images: urls.map((url) => ({ url })),
          demoUrl: item.demoUrl || '',
          category: item.category || '',
        }))
      })
      .catch(() => setError('无法加载作品'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSave = async () => {
    if (!form.title.trim()) { setError('请输入作品标题'); return }
    setSaving(true)
    setError('')
    try {
      const newFiles = form.images.filter((img) => img.file).map((img) => img.file)
      const existingUrls = form.images.filter((img) => img.url).map((img) => img.url)

      const uploadedUrls = []
      for (const file of newFiles) {
        const res = await uploadApi.image(file)
        if (res.code === 200) uploadedUrls.push(res.data.url)
      }

      const allUrls = [...existingUrls, ...uploadedUrls]
      const data = { title: form.title, description: form.description, images: allUrls.join(','), demoUrl: form.demoUrl, category: form.category }

      if (isEdit) {
        await portfolioApi.update(id, data)
      } else {
        await portfolioApi.create(data)
      }
      navigate('/portfolio')
    } catch (err) {
      setError(err?.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="pt-28 pb-24 px-4">
        <div className="max-w-3xl mx-auto animate-pulse space-y-6">
          <div className="h-8 w-48 bg-white/5 rounded-full" />
          <div className="h-64 bg-white/5 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{isEdit ? '编辑作品' : '添加作品'}</h1>
          <div className="flex gap-3">
            <button onClick={() => navigate('/portfolio')} className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all">取消</button>
            <button onClick={handleSave} disabled={saving || !form.title.trim()} className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:opacity-30 text-sm font-medium transition-all">
              {saving ? '上传中...' : '保存'}
            </button>
          </div>
        </motion.div>

        {error && <p className="text-xs text-red-400/80 mb-6">{error}</p>}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-5">
          <input value={form.title} onChange={set('title')} placeholder="作品标题 *" className="w-full px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all" />

          <textarea value={form.description} onChange={set('description')} placeholder="作品描述" rows={4} className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all resize-none" />

          <div>
            <label className="text-xs text-white/30 mb-2 block">作品图片</label>
            <ImageUploader
              images={form.images}
              onImagesChange={(imgs) => setForm((prev) => ({ ...prev, images: imgs }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input value={form.demoUrl} onChange={set('demoUrl')} placeholder="Demo 链接" className="w-full px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all" />
            <input value={form.category} onChange={set('category')} placeholder="分类（如：UI/UX, 后台）" className="w-full px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
