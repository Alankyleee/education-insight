'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

const CATEGORIES = [
  { id: 1, name: '期刊数据库' }, { id: 2, name: '数据分析' }, { id: 3, name: '学习平台' },
  { id: 4, name: '学术工具' }, { id: 5, name: '教育政策' }, { id: 6, name: '测评工具' },
  { id: 7, name: '开放资源' }, { id: 8, name: '专业社群' },
]

interface ResourceFormProps {
  resource?: {
    id: string
    title: string
    url: string
    description: string | null
    category_id: number | null
    thumbnail_url: string | null
    is_featured: boolean
    is_approved: boolean
  }
}

export function ResourceForm({ resource }: ResourceFormProps) {
  const [form, setForm] = useState({
    title: resource?.title ?? '',
    url: resource?.url ?? '',
    description: resource?.description ?? '',
    category_id: resource?.category_id ? String(resource.category_id) : '',
    thumbnail_url: resource?.thumbnail_url ?? '',
    is_featured: resource?.is_featured ?? false,
    is_approved: resource?.is_approved ?? true,
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const update = (field: string, value: string | boolean) =>
    setForm((p) => ({ ...p, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.url) { toast.error('请填写名称和链接'); return }
    setLoading(true)

    try {
      const endpoint = resource ? `/api/admin/resources/${resource.id}` : '/api/admin/resources'
      const method = resource ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          category_id: form.category_id ? parseInt(form.category_id) : null,
          thumbnail_url: form.thumbnail_url || null,
        }),
      })

      if (!res.ok) throw new Error((await res.json()).error)
      toast.success(resource ? '已更新' : '已创建')
      router.push('/admin/resources')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>资源链接 <span className="text-red-500">*</span></Label>
            <Input type="url" placeholder="https://" value={form.url} onChange={(e) => update('url', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>资源名称 <span className="text-red-500">*</span></Label>
            <Input value={form.title} onChange={(e) => update('title', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>简介</Label>
            <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} />
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
            <div className="space-y-2">
              <Label>缩略图 URL（可选）</Label>
              <Input placeholder="https://..." value={form.thumbnail_url} onChange={(e) => update('thumbnail_url', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => update('is_featured', e.target.checked)} className="rounded" />
              设为精选
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_approved} onChange={(e) => update('is_approved', e.target.checked)} className="rounded" />
              立即发布
            </label>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>{loading ? '保存中...' : '保存'}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
