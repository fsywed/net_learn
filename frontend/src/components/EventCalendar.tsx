import { useState, useMemo } from 'react'
import calendarEvents from '../data/event-calendar.json'

type CalendarEvent = {
  id: number
  name: string
  date: string
  end_date: string | null
  type: string
  level: string
  format: string
  location: string
  website: string
  description: string
  difficulty: string
}

const events = calendarEvents as CalendarEvent[]

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const MONTH_NAMES = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
]

// 日期格式化为 YYYY-MM-DD（本地时区）
function formatDate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

// 判断某日期是否在事件的日期范围内
function isDateInRange(dateStr: string, event: CalendarEvent): boolean {
  const target = dateStr
  if (target < event.date) return false
  if (event.end_date && target > event.end_date) return false
  return true
}

// 获取某天的所有事件
function getEventsForDate(dateStr: string): CalendarEvent[] {
  return events.filter((e) => isDateInRange(dateStr, e))
}

// 获取某月的所有事件（用于列表展示）
function getEventsForMonth(year: number, month: number): CalendarEvent[] {
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
  return events
    .filter((e) => {
      // 事件开始日期在该月，或结束日期在该月，或跨越该月
      const startMonth = e.date.slice(0, 7)
      const endMonth = e.end_date ? e.end_date.slice(0, 7) : startMonth
      return monthStr >= startMonth.slice(0, 7) && monthStr <= endMonth.slice(0, 7)
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

export default function EventCalendar() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // 生成日历网格
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const startWeekday = firstDay.getDay() // 0=周日
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

    const cells: { day: number | null; dateStr: string | null }[] = []

    // 上月填充
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ day: null, dateStr: null })
    }

    // 本月日期
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDate(viewYear, viewMonth, d)
      cells.push({ day: d, dateStr })
    }

    // 补齐到 42 格（6 行）
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, dateStr: null })
    }

    return cells
  }, [viewYear, viewMonth])

  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate())

  const monthEvents = getEventsForMonth(viewYear, viewMonth)
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : []

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
    setSelectedDate(null)
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
    setSelectedDate(null)
  }

  const goToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedDate(todayStr)
  }

  return (
    <div className="calendar-section">
      {/* 日历主体 */}
      <div className="calendar-wrapper">
        <div className="calendar-header">
          <button className="cal-nav-btn" onClick={prevMonth} aria-label="上个月">
            ‹
          </button>
          <h3 className="cal-title">
            {viewYear} 年 {MONTH_NAMES[viewMonth]}
          </h3>
          <button className="cal-nav-btn" onClick={nextMonth} aria-label="下个月">
            ›
          </button>
          <button className="cal-today-btn" onClick={goToday}>
            今天
          </button>
        </div>

        <div className="calendar-grid">
          {WEEKDAYS.map((w) => (
            <div key={w} className="cal-weekday">
              {w}
            </div>
          ))}
          {calendarDays.map((cell, idx) => {
            if (!cell.dateStr) {
              return <div key={idx} className="cal-day empty" />
            }
            const dayEvents = getEventsForDate(cell.dateStr)
            const isToday = cell.dateStr === todayStr
            const isSelected = cell.dateStr === selectedDate
            const hasEvents = dayEvents.length > 0

            return (
              <div
                key={idx}
                className={`cal-day${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}${hasEvents ? ' has-events' : ''}`}
                onClick={() => setSelectedDate(cell.dateStr)}
              >
                <span className="cal-day-num">{cell.day}</span>
                {dayEvents.length > 0 && (
                  <div className="cal-day-dots">
                    {dayEvents.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        className={`cal-dot ${e.type === 'CTF' ? 'dot-ctf' : 'dot-cert'}`}
                        title={e.name}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="cal-dot-more">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="calendar-legend">
          <span className="legend-item">
            <span className="cal-dot dot-ctf" /> CTF 比赛
          </span>
          <span className="legend-item">
            <span className="cal-dot dot-cert" /> 认证考试
          </span>
        </div>
      </div>

      {/* 事件列表 */}
      <div className="calendar-events-panel">
        {selectedDate ? (
          <>
            <h3 className="events-panel-title">
              {selectedDate} 的赛事
              <span className="events-count">({selectedEvents.length})</span>
            </h3>
            {selectedEvents.length === 0 ? (
              <p className="no-events">这一天暂无赛事安排</p>
            ) : (
              <div className="event-list">
                {selectedEvents.map((e) => (
                  <div key={e.id} className="event-card">
                    <div className="event-card-header">
                      <span className={`event-type-badge ${e.type === 'CTF' ? 'type-ctf' : 'type-cert'}`}>
                        {e.type}
                      </span>
                      <h4>{e.name}</h4>
                    </div>
                    <p className="event-desc">{e.description}</p>
                    <div className="event-meta">
                      <span>📍 {e.location}</span>
                      <span>🏆 {e.level}</span>
                      <span>📋 {e.format}</span>
                    </div>
                    {e.end_date && e.end_date !== e.date && (
                      <div className="event-date-range">
                        📅 {e.date} ~ {e.end_date}
                      </div>
                    )}
                    <a href={e.website} target="_blank" rel="noopener noreferrer" className="event-link">
                      查看详情 →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="events-panel-title">
              {MONTH_NAMES[viewMonth]}即将到来的赛事
              <span className="events-count">({monthEvents.length})</span>
            </h3>
            {monthEvents.length === 0 ? (
              <p className="no-events">本月暂无赛事安排</p>
            ) : (
              <div className="event-list">
                {monthEvents.map((e) => (
                  <div key={e.id} className="event-card">
                    <div className="event-card-header">
                      <span className={`event-type-badge ${e.type === 'CTF' ? 'type-ctf' : 'type-cert'}`}>
                        {e.type}
                      </span>
                      <h4>{e.name}</h4>
                    </div>
                    <p className="event-desc">{e.description}</p>
                    <div className="event-meta">
                      <span>📅 {e.date}{e.end_date && e.end_date !== e.date ? ` ~ ${e.end_date}` : ''}</span>
                    </div>
                    <div className="event-meta">
                      <span>📍 {e.location}</span>
                      <span>🏆 {e.level}</span>
                    </div>
                    <a href={e.website} target="_blank" rel="noopener noreferrer" className="event-link">
                      查看详情 →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
