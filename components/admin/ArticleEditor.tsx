'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { slugify } from '@/lib/utils'

// Dynamic import to avoid SSR issues with CodeMirror
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

const CATEGORIES = [
  { id: 2, name: '数据分析' }, { id: 9, name: '统计分析' }, { id: 10, name: '质性研究' },
  { id: 11, name: '结构方程模型' }, { id: 12, name: '教育大数据' }, { id: 13, name: '可视化工具' },
  { id: 1, name: '期刊数据库' }, { id: 3, name: '学习平台' }, { id: 4, name: '学术工具' },
]

interface ArticleEditorProps {
  article?: {
    id: string
    title: string
    slug: string
    content: string
    excerpt: string | null
    category_id: number | null
    is_published: boolean
  }
}

export function ArticleEditor({ article }: ArticleEditorProps) {
  const [form, setForm] = useState({
    title: article?.title ?? '',
    slug: article?.slug ?? '',
    excerpt: article?.excerpt ?? '',
    category_id: article?.category_id ? String(article.category_id) : '',
    is_published: article?.is_published ?? false,
  })
  const [content, setContent] = useState(article?.content ?? '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const update = (field: string, value: string | boolean) =>
    setForm((p) => ({ ...p, [field]: value }))

  const handleTitleChange = (title: string) => {
    update('title', title)
    if (!article) update('slug', slugify(title))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.slug || !content) { toast.error('请填写标题、Slug 和内容'); return }
    setLoading(true)

    try {
      const endpoint = article ? `/api/admin/articles/${article.id}` : '/api/admin/articles'
      const method = article ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          content,
          category_id: form.category_id ? parseInt(form.category_id) : null,
          excerpt: form.excerpt || null,
        }),
      })

      if (!res.ok) throw new Error((await res.json()).error)
      toast.success(article ? '已更新' : '已创建')
      router.push('/admin/articles')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>标题 <span className="text-red-500">*</span></Label>
          <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Slug <span className="text-red-500">*</span></Label>
          <Input value={form.slug} onChange={(e) => update('slug', e.target.value)} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>分类</Label>
          <Select value={form.category_id} onValueChange={(v) => update('category_id', v)}>
            <SelectTrigger><SelectValue placeholder="选择分类" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm cursor-pointer pb-2">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => update('is_published', e.target.checked)}
              className="rounded"
            />
            立即发布
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>摘要</Label>
        <Textarea
          placeholder="文章简短描述..."
          value={form.excerpt}
          onChange={(e) => update('excerpt', e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>内容（Markdown）<span className="text-red-500">*</span></Label>
        <div data-color-mode="light">
          <MDEditor
            value={content}
            onChange={(v) => setContent(v ?? '')}
            height={500}
            preview="live"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? '保存中...' : '保存'}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
      </div>
    </form>
  )
}
