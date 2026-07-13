import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'

// 路由级懒加载：按需加载页面，减小首屏 JS 体积
const CourseList = lazy(() => import('./pages/CourseList'))
const CourseDetail = lazy(() => import('./pages/CourseDetail'))
const TargetList = lazy(() => import('./pages/TargetList'))
const TargetDetail = lazy(() => import('./pages/TargetDetail'))
const Competitions = lazy(() => import('./pages/Competitions'))
const GettingStarted = lazy(() => import('./pages/GettingStarted'))
const Toolbox = lazy(() => import('./pages/Toolbox'))
const About = lazy(() => import('./pages/About'))
const ProblemSetList = lazy(() => import('./pages/ProblemSetList'))
const ProblemSetDetail = lazy(() => import('./pages/ProblemSetDetail'))

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Suspense fallback={<div className="loading-state">加载中...</div>}><CourseList /></Suspense>} />
        <Route path="/courses/:courseId" element={<Suspense fallback={<div className="loading-state">加载中...</div>}><CourseDetail /></Suspense>} />
        <Route path="/targets" element={<Suspense fallback={<div className="loading-state">加载中...</div>}><TargetList /></Suspense>} />
        <Route path="/targets/:templateId" element={<Suspense fallback={<div className="loading-state">加载中...</div>}><TargetDetail /></Suspense>} />
        <Route path="/competitions" element={<Suspense fallback={<div className="loading-state">加载中...</div>}><Competitions /></Suspense>} />
        <Route path="/getting-started" element={<Suspense fallback={<div className="loading-state">加载中...</div>}><GettingStarted /></Suspense>} />
        <Route path="/toolbox" element={<Suspense fallback={<div className="loading-state">加载中...</div>}><Toolbox /></Suspense>} />
        <Route path="/problemsets" element={<Suspense fallback={<div className="loading-state">加载中...</div>}><ProblemSetList /></Suspense>} />
        <Route path="/problemsets/:setId" element={<Suspense fallback={<div className="loading-state">加载中...</div>}><ProblemSetDetail /></Suspense>} />
        <Route path="/about" element={<Suspense fallback={<div className="loading-state">加载中...</div>}><About /></Suspense>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
