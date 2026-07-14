import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { aiApi } from '../../api/index.js'

export default function KnowledgePage() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const inputRef = useRef(null)

  const load = () => {
    setLoading(true)
    aiApi.listKnowledge()
      .then((res) => {
        if (res.code === 200) {
          setDocs(res.data || [])
        } else {
          setError(res.message || '无法加载知识库')
        }
      })
      .catch((err) => setError(err.message || '无法加载知识库'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    if (title.trim()) formData.append('title', title.trim())
    try {
      const res = await aiApi.uploadKnowledge(formData)
      if (res.code !== 200) {
        throw new Error(res.message || '上传失败')
      }
      setTitle('')
      load()
    } catch (err) {
      setError(err.message || '上传失败')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (id, docTitle) => {
    if (!window.confirm(`确定删除《${docTitle}》？`)) return
    try {
      const res = await aiApi.deleteKnowledge(id)
      if (res.code !== 200) {
        throw new Error(res.message || '删除失败')
      }
      load()
    } catch (err) {
      setError(err.message || '删除失败')
    }
  }

  const formatSize = (content) => {
    const bytes = new Blob([content || '']).size
    if (bytes < 1024) return bytes + 'B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
  }

  return (
    <div className="pt-28 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">知识库管理</h1>
          <p className="text-white/30 text-sm mb-8">上传你的文档，AI 对话将基于这些内容回答。</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-10"
        >
          <h2 className="text-sm font-medium text-white/70 mb-4">上传新文档</h2>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="文档标题（选填，默认使用文件名）"
              className="flex-1 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-all"
            />
            <input ref={inputRef} type="file" accept=".txt,.md,.pdf,.json,.csv,.yaml,.yml" onChange={handleUpload} className="hidden" />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:opacity-30 text-sm font-medium transition-all shrink-0"
            >
              {uploading ? '上传中...' : '选择文件上传'}
            </button>
          </div>
          <p className="text-[11px] text-white/20">支持 TXT / MD / PDF / JSON / CSV / YAML，上传后自动向量化存入知识库。</p>
        </motion.div>

        {error && <p className="text-xs text-red-400/80 mb-6">{error}</p>}

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-2xl" />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-white/20">知识库为空</p>
            <p className="text-white/10 text-sm mt-1">上传文档后，AI 对话会自动检索相关内容。</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            {docs.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-white/70 truncate">{doc.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300/60 shrink-0">{doc.source || 'upload'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-white/20">
                    <span>{formatSize(doc.content)}</span>
                    <span>{doc.createdAt?.split('T')[0]}</span>
                    <span>向量已写入</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id, doc.title)}
                  className="text-xs text-red-400/40 hover:text-red-400 transition-colors shrink-0 ml-4 opacity-0 group-hover:opacity-100"
                >
                  删除
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
