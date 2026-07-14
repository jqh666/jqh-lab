import { useState, useEffect, useRef, lazy } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { dashboardApi, blogApi, projectApi } from '../../api/index.js'

const HeroScene3D = lazy(() => import('../../components/three/HeroScene3D.jsx'))

const SKILLS = [
  { name: 'Java / Spring Boot', level: 90, color: '#6366f1' },
  { name: 'Python / Agent', level: 85, color: '#a855f7' },
  { name: 'React / Vue3', level: 82, color: '#06b6d4' },
  { name: 'PostgreSQL', level: 78, color: '#22c55e' },
  { name: 'Docker / K8s', level: 75, color: '#f59e0b' },
  { name: 'DeepSeek / AI', level: 80, color: '#ef4444' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] } },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] } },
}

function AnimatedNumber({ value }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1500
    const step = Math.ceil(value / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, value])

  return <span ref={ref}>{count}</span>
}

function useInView(ref, opts = {}) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } },
      { threshold: 0.1, ...opts }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, opts])
  return inView
}

export default function Home() {
  const [stats, setStats] = useState({ blogCount: 0, projectCount: 0, portfolioCount: 0 })
  const [recentBlogs, setRecentBlogs] = useState([])
  const [featuredProjects, setFeaturedProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      dashboardApi.stats(),
      blogApi.list({ page: 0, size: 3 }),
      projectApi.list(),
    ]).then(([statsRes, blogRes, projectRes]) => {
      if (statsRes.code === 200) setStats(statsRes.data)
      if (blogRes.code === 200) setRecentBlogs(blogRes.data.records || [])
      if (projectRes.code === 200) {
        const featured = (projectRes.data || []).filter((p) => p.isFeatured)
        setFeaturedProjects(featured.length > 0 ? featured.slice(0, 3) : projectRes.data.slice(0, 3))
      }
    }).catch(() => setError('部分数据加载失败'))
    .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: '项目经验', value: stats.projectCount || 0, icon: '💼' },
    { label: '博客文章', value: stats.blogCount || 0, icon: '📝' },
    { label: 'AI 对话次数', value: 0, icon: '🤖' },
    { label: '作品集', value: stats.portfolioCount || 0, icon: '🎨' },
  ]

  return (
    <div className="relative">
      {/* ===== Hero Section ===== */}
      <motion.section
        initial="hidden"
        animate="visible"
        className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
      >
        <HeroScene3D />

        <motion.div
          variants={containerVariants}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 p-[3px] shadow-2xl shadow-indigo-500/30">
            <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center text-5xl">
              🧠
            </div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              沁昊の脑洞实验室
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI 全栈开发者 · Java 后端 · Python Agent · React + Vue3
          </motion.p>
          <motion.p variants={itemVariants} className="text-base text-white/30 max-w-xl mx-auto mb-12">
            用代码构建世界，用 AI 探索未来。
            一个全栈开发者的技术博客与创意实验室。
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/projects"
                className="group relative px-8 py-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-all duration-500 overflow-hidden inline-block"
              >
                <span className="relative z-10 text-sm font-medium tracking-wide">
                  查看我的项目
                </span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/ai-chat"
                className="group relative px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 transition-all duration-500 shadow-lg shadow-indigo-500/25 inline-block"
              >
                <span className="text-sm font-medium tracking-wide">
                  AI 了解我 →
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/10 flex items-start justify-center pt-2 animate-bounce">
            <div className="w-1 h-2 bg-white/30 rounded-full" />
          </div>
        </motion.div>
      </motion.section>

      {/* ===== Stats Section ===== */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="px-4 py-24"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {statCards.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -4 }}
                className="group relative p-[1px] rounded-[1.5rem] bg-gradient-to-b from-white/10 to-transparent cursor-default"
              >
                <div className="relative rounded-[1.5rem] bg-[#0a0a0a] p-6 overflow-hidden">
                  <div className="text-3xl mb-3">{stat.icon}</div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    <AnimatedNumber value={stat.value} />
                  </div>
                  <div className="text-sm text-white/40">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ===== Skills Section ===== */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="px-4 py-24"
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-4"
          >
            技能图谱
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/30 text-center mb-16 max-w-md mx-auto"
          >
            每一项技能都是一次探险的结晶
          </motion.p>

          <div className="space-y-6">
            {SKILLS.map((skill, i) => (
              <SkillBar key={skill.name} skill={skill} index={i} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ===== Latest Blog Section ===== */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="px-4 py-24"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">最新博客</h2>
              <p className="text-white/30 mt-2">记录成长与思考</p>
            </div>
            <Link
              to="/blog"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              查看全部 →
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-white/5 rounded-[1.5rem]" />
              ))}
            </div>
          ) : recentBlogs.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6"
            >
              {recentBlogs.map((post) => (
                <motion.div key={post.id} variants={itemVariants} whileHover={{ y: -6 }}>
                  <Link
                    to={`/blog/${post.id}`}
                    className="group block relative p-[1px] rounded-[1.5rem] bg-gradient-to-b from-white/8 to-transparent hover:from-white/15 transition-all duration-500 h-full"
                  >
                    <div className="rounded-[1.5rem] bg-[#0a0a0a] p-6 h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/50">{post.categoryId || '未分类'}</span>
                        <span className="text-xs text-white/20">{post.createdAt?.split('T')[0]}</span>
                      </div>
                      <h3 className="text-lg font-medium text-white/80 group-hover:text-white transition-colors mb-2 flex-1">
                        {post.title}
                      </h3>
                      <span className="text-xs text-white/20 group-hover:text-white/40 transition-colors">
                        阅读全文 →
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-white/20 text-center">暂无文章</p>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/blog" className="text-sm text-white/40 hover:text-white/70 transition-colors">
              查看全部 →
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ===== Featured Projects ===== */}
      <motion.section
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="px-4 py-24"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            精选项目
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/30 mb-12 max-w-md mx-auto"
          >
            有趣的项目值得被看见
          </motion.p>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6 animate-pulse mb-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-white/5 rounded-[1.5rem]" />
              ))}
            </div>
          ) : featuredProjects.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
              {featuredProjects.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                >
                  <div className="p-[1px] rounded-[1.5rem] bg-gradient-to-b from-white/10 to-transparent h-full">
                    <div className="rounded-[1.5rem] bg-[#0a0a0a] p-6 h-full">
                      <h3 className="text-lg font-medium text-white/80 mb-2">{p.title}</h3>
                      <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{p.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : null}

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/projects"
              className="inline-flex px-8 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 text-sm"
            >
              查看全部项目 →
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}

function SkillBar({ skill, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="group"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-white/70">{skill.name}</span>
        <span className="text-xs text-white/30">{skill.level}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={inView ? { width: `${skill.level}%` } : { width: 0 }}
          transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1], delay: index * 0.1 }}
          style={{
            backgroundColor: skill.color,
            boxShadow: inView ? `0 0 20px ${skill.color}40` : 'none',
          }}
        />
      </div>
    </motion.div>
  )
}
