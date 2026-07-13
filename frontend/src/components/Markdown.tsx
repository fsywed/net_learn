import { useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// 轻量 Markdown 渲染器
// 用 marked + DOMPurify 替代 @uiw/react-markdown-preview（968KB -> ~60KB）
marked.setOptions({
  breaks: true,
  gfm: true,
})

export default function Markdown({ source }: { source: string }) {
  const html = useMemo(() => {
    if (!source) return ''
    const raw = marked.parse(source, { async: false }) as string
    return DOMPurify.sanitize(raw)
  }, [source])

  return <div className="wmde-markdown" dangerouslySetInnerHTML={{ __html: html }} />
}
