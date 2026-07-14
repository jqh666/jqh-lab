import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { blogApi } from '../../api/index.js'

const postVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const size = 10

  useEffect(() => {
    blogApi.categories()
      .then((res) => { if (res.code === 200) setCategories(res.data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')
    const params = { page, size }
    if (activeCategory) params.category = activeCategory
    blogApi.list(params)
      .then((res) => {
        if (res.code === 200) {
          setPosts(res.data.records || [])
          setTotal(res.data.total || 0)
        }
      })
      .catch(() => setError('无法加载博客列表'))
      .finally(() => setLoading(false))
  }, [page, activeCategory])

  const handleCategoryChange = (slug) => {
    setActiveCategory(slug)
    setPage(0)
  }

  return (
    <div className="pt-32 pb-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">博客</h1>
          <p className="text-white/40">技术 · 生活 · 成长 · 碎碎念</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center gap-2 mb-12 flex-wrap"
        >
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-5 py-2 rounded-full text-sm transition-all ${
              !activeCategory ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10'
            }`}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-5 py-2 rounded-full text-sm transition-all ${
                activeCategory === cat.slug ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </motion.div>

        {error && <p className="text-xs text-red-400/80 text-center mb-8">{error}</p>}

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-[1.5rem]" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-white/20 text-center">暂无文章</p>
        ) : (
          <>
            <motion.div layout className="space-y-4">
              <AnimatePresence mode="popLayout">
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    layout
                    variants={postVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    whileHover={{ x: 4 }}
                  >
                    <Link
                      to={`/blog/${post.id}`}
                      className="group block p-[1px] rounded-[1.5rem] bg-gradient-to-b from-white/8 to-transparent hover:from-white/15 transition-all duration-500"
                    >
                      <div className="rounded-[1.5rem] bg-[#0a0a0a] p-6 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/40">
                              {categories.find((c) => c.id === post.categoryId)?.name || '未分类'}
                            </span>
                            <span className="text-xs text-white/20">{post.createdAt?.split('T')[0]}</span>
                          </div>
                          <h2 className="text-lg font-medium text-white/80 group-hover:text-white transition-colors">{post.title}</h2>
                        </div>
                        <span className="text-xs text-white/20 group-hover:text-white/40 transition-colors shrink-0">阅读 →</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {total > size && (
              <div className="flex justify-center gap-3 mt-12">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 text-sm transition-all"
                >
                  上一页
                </button>
                <span className="flex items-center text-xs text-white/30">
                  {page + 1} / {Math.ceil(total / size)}
                </span>
                <button
                  disabled={(page + 1) * size >= total}
                  onClick={() => setPage(page + 1)}
                  className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 text-sm transition-all"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
