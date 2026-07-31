import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import Home from './pages/Home/Home.jsx'
import Projects from './pages/Projects/Projects.jsx'
import ProjectEditor from './pages/Projects/ProjectEditor.jsx'
import Portfolio from './pages/Portfolio/Portfolio.jsx'
import PortfolioDetail from './pages/Portfolio/PortfolioDetail.jsx'
import PortfolioEditor from './pages/Portfolio/PortfolioEditor.jsx'
import AIChat from './pages/AIChat/AIChat.jsx'
import Blog from './pages/Blog/Blog.jsx'
import BlogDetail from './pages/Blog/BlogDetail.jsx'
import Login from './pages/Login/Login.jsx'
import Editor from './pages/Editor/Editor.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import DataCenter from './pages/DataCenter/DataCenter.jsx'
import KnowledgePage from './pages/Knowledge/KnowledgePage.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import useAuthStore from './stores/authStore.js'
import { trackPageView } from './utils/tracker.js'

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  )
}

function App() {
  const location = useLocation()
  const checkAuth = useAuthStore((s) => s.checkAuth)
  const user = useAuthStore((s) => s.user)
  const isChatPage = location.pathname === '/ai-chat'
  const lastTrackedPathRef = useRef('')

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    const path = `${location.pathname}${location.search}`
    if (lastTrackedPathRef.current === path) return
    lastTrackedPathRef.current = path
    trackPageView(path, document.title, user?.role)
  }, [location.pathname, location.search, user?.role])

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      <Navbar />
      <main className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/projects" element={<PageWrapper><Projects /></PageWrapper>} />
            <Route path="/projects/new" element={<ProtectedRoute><PageWrapper><ProjectEditor /></PageWrapper></ProtectedRoute>} />
            <Route path="/projects/edit/:id" element={<ProtectedRoute><PageWrapper><ProjectEditor /></PageWrapper></ProtectedRoute>} />
            <Route path="/portfolio" element={<PageWrapper><Portfolio /></PageWrapper>} />
            <Route path="/portfolio/new" element={<ProtectedRoute><PageWrapper><PortfolioEditor /></PageWrapper></ProtectedRoute>} />
            <Route path="/portfolio/edit/:id" element={<ProtectedRoute><PageWrapper><PortfolioEditor /></PageWrapper></ProtectedRoute>} />
            <Route path="/portfolio/:id" element={<PageWrapper><PortfolioDetail /></PageWrapper>} />
            <Route path="/ai-chat" element={<PageWrapper><AIChat /></PageWrapper>} />
            <Route path="/blog" element={<PageWrapper><Blog /></PageWrapper>} />
            <Route path="/blog/:id" element={<PageWrapper><BlogDetail /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/editor" element={
              <ProtectedRoute><PageWrapper><Editor /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/editor/:id" element={
              <ProtectedRoute><PageWrapper><Editor /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/knowledge" element={
              <ProtectedRoute><PageWrapper><KnowledgePage /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/data-center" element={
              <ProtectedRoute><PageWrapper><DataCenter /></PageWrapper></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isChatPage && <Footer />}
    </div>
  )
}

export default App
