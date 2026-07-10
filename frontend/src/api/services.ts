import axios from 'axios'
import client from './client'

/* ============================================================
 * 类型定义（与后端 API 契约对应）
 * ============================================================ */

// 认证
export interface AuthResponse {
  access_token: string
  token_type: string
  role: string
}
export interface UserInfo {
  id: number
  email: string
  role: string
  status: string
  score: number
  created_at: string
}

// 课程
export interface Chapter {
  id: number
  title: string
  order: number
}
export interface Course {
  id: number
  title: string
  description: string
  status: string
  chapters: Chapter[]
}
export interface ChapterDetail {
  id: number
  course_id: number
  title: string
  content: string
  order: number
  created_at: string
}

// 靶机模板（学员接口无 flag）
export interface TargetTemplate {
  id: number
  name: string
  description: string
  difficulty: string
  image: string
  ports: string
  status: string
  created_at: string
}
// 管理接口含 flag
export interface TargetTemplateAdmin extends TargetTemplate {
  flag: string
}

// 靶机实例
export interface Instance {
  id: number
  template_id: number
  user_id?: number
  status: string
  access_host?: string
  access_port?: number
  expires_at?: string
  created_at?: string
}
export interface StartInstanceResponse {
  instance: Instance
  access_host: string
  access_port: number
  expires_at: string
  remaining_seconds: number
}

// Flag 提交
export interface SubmissionResult {
  is_correct: boolean
  message: string
  score_awarded: number
  already_solved: boolean
}
export interface SolvedRecord {
  id: number
  user_id: number
  template_id: number
  template_name: string
  is_correct: boolean
  created_at: string
}

// 个人中心
export interface ProfileData {
  user_info: {
    email: string
    role: string
    score: number
    created_at: string
  }
  solved_count: number
  score: number
  recent_solved: Array<{
    template_id: number
    template_name: string
    difficulty: string
    solved_at: string
  }>
  recent_activity: Array<{
    type: string
    template_id: number
    template_name: string
    description: string
    created_at: string
  }>
}

// 管理后台
export interface OverviewStats {
  users_total: number
  students: number
  admins: number
  targets_total: number
  targets_published: number
  instances_total: number
  instances_running: number
  submissions_total: number
  solved_total: number
}
export interface LeaderboardEntry {
  user_id: number
  email: string
  solved_count: number
  score: number
}
export interface AdminUser {
  id: number
  email: string
  role: string
  status: string
  score: number
  created_at: string
}
export interface PaginatedUsers {
  items: AdminUser[]
  total: number
}

/* ============================================================
 * API 模块封装
 * ============================================================ */

export const authApi = {
  register: (email: string, password: string) =>
    client
      .post<AuthResponse>('/auth/register', { email, password })
      .then((r) => r.data),
  login: (email: string, password: string) =>
    client
      .post<AuthResponse>('/auth/login', { email, password })
      .then((r) => r.data),
  me: () => client.get<UserInfo>('/auth/me').then((r) => r.data),
}

export const courseApi = {
  list: () => client.get<Course[]>('/courses/').then((r) => r.data),
  detail: (courseId: number) =>
    client.get<Course>(`/courses/${courseId}`).then((r) => r.data),
  chapter: (courseId: number, chapterId: number) =>
    client
      .get<ChapterDetail>(`/courses/${courseId}/chapters/${chapterId}`)
      .then((r) => r.data),
}

export const targetApi = {
  list: () => client.get<TargetTemplate[]>('/targets/').then((r) => r.data),
  detail: (templateId: number) =>
    client.get<TargetTemplate>(`/targets/${templateId}`).then((r) => r.data),
}

export const instanceApi = {
  list: () => client.get<Instance[]>('/instances/').then((r) => r.data),
  detail: (instanceId: number) =>
    client.get<Instance>(`/instances/${instanceId}`).then((r) => r.data),
  start: (templateId: number) =>
    client
      .post<StartInstanceResponse>(`/instances/${templateId}/start`)
      .then((r) => r.data),
  destroy: (instanceId: number): Promise<void> =>
    client.delete(`/instances/${instanceId}`).then(() => undefined),
}

export const submissionApi = {
  submit: (templateId: number, flag: string) =>
    client
      .post<SubmissionResult>(`/submissions/${templateId}/submit`, { flag })
      .then((r) => r.data),
  solved: () => client.get<SolvedRecord[]>('/submissions/solved').then((r) => r.data),
}

export const profileApi = {
  get: () => client.get<ProfileData>('/profile/').then((r) => r.data),
}

export const adminApi = {
  // 统计
  overview: () =>
    client.get<OverviewStats>('/admin/stats/overview').then((r) => r.data),
  leaderboard: () =>
    client.get<LeaderboardEntry[]>('/admin/stats/leaderboard').then((r) => r.data),
  // 用户
  users: (params?: {
    role?: string
    status?: string
    page?: number
    page_size?: number
  }) => client.get<PaginatedUsers>('/admin/users/', { params }).then((r) => r.data),
  userDetail: (userId: number) =>
    client.get<AdminUser>(`/admin/users/${userId}`).then((r) => r.data),
  updateUserStatus: (userId: number, status: 'active' | 'disabled'): Promise<void> =>
    client.put(`/admin/users/${userId}/status`, { status }).then(() => undefined),
  updateUserRole: (userId: number, role: 'student' | 'admin'): Promise<void> =>
    client.put(`/admin/users/${userId}/role`, { role }).then(() => undefined),
  // 课程管理
  courses: () => client.get<Course[]>('/admin/courses/').then((r) => r.data),
  createCourse: (data: {
    title: string
    description: string
    status?: string
  }) => client.post<Course>('/admin/courses/', data).then((r) => r.data),
  updateCourse: (
    id: number,
    data: { title?: string; description?: string; status?: string },
  ) => client.put<Course>(`/admin/courses/${id}`, data).then((r) => r.data),
  deleteCourse: (id: number): Promise<void> =>
    client.delete(`/admin/courses/${id}`).then(() => undefined),
  // 章节管理
  createChapter: (
    courseId: number,
    data: { title: string; content: string; order?: number },
  ) =>
    client
      .post(`/admin/courses/${courseId}/chapters`, data)
      .then((r) => r.data),
  updateChapter: (
    chapterId: number,
    data: { title?: string; content?: string; order?: number },
  ) =>
    client
      .put(`/admin/courses/chapters/${chapterId}`, data)
      .then((r) => r.data),
  deleteChapter: (chapterId: number): Promise<void> =>
    client.delete(`/admin/courses/chapters/${chapterId}`).then(() => undefined),
  // 靶机管理
  targets: () =>
    client.get<TargetTemplateAdmin[]>('/admin/targets/').then((r) => r.data),
  createTarget: (data: {
    name: string
    description: string
    difficulty: string
    image: string
    ports: string
    flag: string
    status?: string
  }) => client.post<TargetTemplateAdmin>('/admin/targets/', data).then((r) => r.data),
  updateTarget: (
    id: number,
    data: Partial<{
      name: string
      description: string
      difficulty: string
      image: string
      ports: string
      flag: string
      status: string
    }>,
  ) => client.put<TargetTemplateAdmin>(`/admin/targets/${id}`, data).then((r) => r.data),
  deleteTarget: (id: number): Promise<void> =>
    client.delete(`/admin/targets/${id}`).then(() => undefined),
}

/* ============================================================
 * 工具函数
 * ============================================================ */

// 统一提取后端错误信息（FastAPI 通常返回 {detail:"..."}）
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { detail?: unknown; message?: string }
      | undefined
    if (data?.detail) {
      if (typeof data.detail === 'string') return data.detail
      if (Array.isArray(data.detail)) {
        const first = data.detail[0] as { msg?: string } | undefined
        if (first?.msg) return first.msg
      }
    }
    if (data?.message) return data.message
    if (err.message) return err.message
    return '请求失败'
  }
  return '未知错误'
}

// 难度样式类名
export function difficultyClass(d: string): string {
  const v = (d || '').toLowerCase()
  if (v === 'easy') return 'badge-easy'
  if (v === 'medium') return 'badge-medium'
  if (v === 'hard') return 'badge-hard'
  return 'badge-medium'
}

// 难度中文标签
export function difficultyLabel(d: string): string {
  const v = (d || '').toLowerCase()
  if (v === 'easy') return '简单'
  if (v === 'medium') return '中等'
  if (v === 'hard') return '困难'
  return d || '未知'
}
