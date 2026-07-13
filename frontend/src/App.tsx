import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CourseList from './pages/CourseList'
import CourseDetail from './pages/CourseDetail'
import TargetList from './pages/TargetList'
import TargetDetail from './pages/TargetDetail'
import Competitions from './pages/Competitions'
import GettingStarted from './pages/GettingStarted'
import Toolbox from './pages/Toolbox'
import About from './pages/About'
import ProblemSetList from './pages/ProblemSetList'
import ProblemSetDetail from './pages/ProblemSetDetail'

// 应用路由：全部公开访问，无登录态
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/targets" element={<TargetList />} />
        <Route path="/targets/:templateId" element={<TargetDetail />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/getting-started" element={<GettingStarted />} />
        <Route path="/toolbox" element={<Toolbox />} />
        <Route path="/problemsets" element={<ProblemSetList />} />
        <Route path="/problemsets/:setId" element={<ProblemSetDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
