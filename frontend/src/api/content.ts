// 静态内容数据加载：构建时通过 Vite 内联进 JS bundle，永不依赖网络
import coursesData from '../data/courses.json'
import targetsData from '../data/targets.json'

// 课程与章节
export interface Chapter {
  id: number
  course_id: number
  title: string
  content: string
  order: number
}
export interface Course {
  id: number
  title: string
  description: string
  status: string
  chapters: Chapter[]
}

// 靶机模板（静态展示用）
// 用户本地启动容器 → 输入地址 → 网站 iframe 嵌入 → 本地验证 Flag
export interface TargetTemplate {
  id: number
  name: string
  description: string
  difficulty: string
  category: string
  default_port: number
  skills: string[]
  docker_run: string
  solution_steps: string[]
  learn_points: string[]
  points: number
  estimated_time: string
  solved_count: number
}

// 直接同步读取构建期内联的 JSON
export const courses: Course[] = coursesData.courses
export const targets: TargetTemplate[] = targetsData.targets

// 工具函数
export function difficultyClass(d: string): string {
  const v = (d || '').toLowerCase()
  if (v === 'easy') return 'badge-easy'
  if (v === 'medium') return 'badge-medium'
  if (v === 'hard') return 'badge-hard'
  return 'badge-medium'
}

export function difficultyLabel(d: string): string {
  const v = (d || '').toLowerCase()
  if (v === 'easy') return '简单'
  if (v === 'medium') return '中等'
  if (v === 'hard') return '困难'
  return d || '未知'
}
