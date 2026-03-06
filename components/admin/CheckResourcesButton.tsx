'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Wifi } from 'lucide-react'

export function CheckResourcesButton() {
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    setLoading(true)
    toast.info('正在检查所有链接，请稍候...')
    try {
      const res = await fetch('/api/admin/check-resources', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`检查完成：${data.online} 个可访问，${data.offline} 个不可访问`)
      window.location.reload()
    } catch {
      toast.error('检查失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCheck} disabled={loading}>
      <Wifi className="h-4 w-4 mr-1" />
      {loading ? '检查中...' : '检查可访问性'}
    </Button>
  )
}
