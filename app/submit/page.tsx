'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TurnstileWidget } from '@/components/submission/TurnstileWidget'
import { toast } from 'sonner'

// Top-level categories - in production fetch from API
const CATEGORIES = [
  { id: 1, name: '期刊数据库' },
  { id: 2, name: '数据分析' },
  { id: 3, name: '学习平台' },
  { id: 4, name: '学术工具' },
  { id: 5, name: '教育政策' },
  { id: 6, name: '测评工具' },
  { id: 7, name: '开放资源' },
  { id: 8, name: '专业社群' },
]

export default function SubmitPage() {
  const [form, setForm] = useState({
    title: '',
    url: '',
    description: '',
    category_id: '',
    submitter_name: '',
    submitter_email: '',
  })
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileKey, setTurnstileKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title.trim() || !form.url.trim()) {
      toast.error('请填写资源名称和链接')
      return
    }

    try { new URL(form.url) } catch { toast.error('请输入有效的链接地址（包含 http/https）'); return }

    if (!turnstileToken && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      toast.error('请完成验证码')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          category_id: form.category_id ? parseInt(form.category_id) : null,
          turnstile_token: turnstileToken || 'dev-bypass',
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? '提交失败')

      setSubmitted(true)
    } catch (err: any) {
      toast.error(err.message || '提交失败，请稍后重试')
      // Reset Turnstile to get a fresh token for retry
      setTurnstileToken('')
      setTurnstileKey((k) => k + 1)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">提交成功！</h1>
        <p className="text-gray-500 mb-6">
          感谢你的贡献！我们会在审核后将资源发布到平台，通常需要 1-3 个工作日。
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => setSubmitted(false)}>继续提交</Button>
          <Button asChild><a href="/resources">浏览资源</a></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">提交资源</h1>
        <p className="text-gray-500 text-sm mt-1">
          推荐优质教育资源，经管理员审核后将展示在平台上
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">资源信息</CardTitle>
          <CardDescription>请填写准确的资源信息，有助于通过审核</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="url">资源链接 <span className="text-red-500">*</span></Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={form.url}
                onChange={(e) => update('url', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">资源名称 <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="资源的名称"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">简介</Label>
              <Textarea
                id="description"
                placeholder="简要描述这个资源的内容和用途..."
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">分类</Label>
              <Select value={form.category_id} onValueChange={(v) => update('category_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类（可选）" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">你的名字（可选）</Label>
                <Input
                  id="name"
                  placeholder="昵称或真名"
                  value={form.submitter_name}
                  onChange={(e) => update('submitter_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱（可选）</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="审核结果通知"
                  value={form.submitter_email}
                  onChange={(e) => update('submitter_email', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>验证码</Label>
              <TurnstileWidget
                key={turnstileKey}
                onVerify={setTurnstileToken}
                onError={() => toast.error('验证码加载失败，请刷新页面')}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '提交中...' : '提交资源'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
