import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { projectApi, uploadApi } from '../../api/index.js'
import ImageUploader from '../../components/ImageUploader.jsx'

export default function ProjectEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({ title: '', description: '', techStack: '', githubUrl: '', demoUrl: '', coverImages: [], isFeatured: false })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    projectApi.list()
      .then((res) => {
        if (res.code !== 200) return
        const item = res.data.find((p) => p.id === Number(id))
        if (item) {
          setForm({
            title: item.title || '',
            description: item.description || '',
            techStack: item.techStack || '',
            githubUrl: item.githubUrl || '',
            demoUrl: item.demoUrl || '',
            coverImages: item.coverImage ? [{ url: item.coverImage }] : [],
            isFeatured: item.isFeatured || false,
          })
        }
      })
      .catch(() => setError('无法加载项目'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setError('请输入项目标题'); return }
    setSaving(true)
    setError('')
    try {
      let coverImage = ''
      const newFiles = form.coverImages.filter((img) => img.file).map((img) => img.file)
      const existingUrls = form.coverImages.filter((img) => img.url).map((img) => img.url)

      if (newFiles.length > 0) {
        const res = await uploadApi.image(newFiles[0])
        if (res.code === 200) coverImage = res.data.url
      } else if (existingUrls.length > 0) {
        coverImage = existingUrls[0]
      }

      const data = { title: form.title, description: form.description, techStack: form.techStack, githubUrl: form.githubUrl, demoUrl: form.demoUrl, coverImage, isFeatured: form.isFeatured }

      if (isEdit) {
        await projectApi.update(id, data)
      } else {
        await projectApi.create(data)
      }
      navigate('/projects')
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
          <h1 className="text-3xl font-bold">{isEdit ? '编辑项目' : '添加项目'}</h1>
          <div className="flex gap-3">
            <button onClick={() => navigate('/projects')} className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all">取消</button>
            <button onClick={handleSave} disabled={saving || !form.title.trim()} className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:opacity-30 text-sm font-medium transition-all">
              {saving ? '上传中...' : '保存'}
            </button>
          </div>
        </motion.div>

        {error && <p className="text-xs text-red-400/80 mb-6">{error}</p>}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-5">
          <input value={form.title} onChange={set('title')} placeholder="项目标题 *" className="w-full px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all" />

          <textarea value={form.description} onChange={set('description')} placeholder="项目描述" rows={4} className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all resize-none" />

          <input value={form.techStack} onChange={set('techStack')} placeholder="技术栈（逗号分隔，如：Java, Spring Boot, React）" className="w-full px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all" />

          <div className="grid grid-cols-2 gap-4">
            <input value={form.githubUrl} onChange={set('githubUrl')} placeholder="GitHub 链接" className="w-full px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all" />
            <input value={form.demoUrl} onChange={set('demoUrl')} placeholder="Demo 链接" className="w-full px-5 py-3.5 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all" />
          </div>

          <div>
            <label className="text-xs text-white/30 mb-2 block">封面图</label>
            <ImageUploader
              images={form.coverImages}
              onImagesChange={(imgs) => setForm((prev) => ({ ...prev, coverImages: imgs }))}
              maxImages={1}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} className="w-4 h-4 rounded border-white/20 bg-white/5 accent-indigo-500" />
            <span className="text-sm text-white/60">设为精选项目（展示在首页）</span>
          </label>
        </motion.div>
      </div>
    </div>
  )
}
