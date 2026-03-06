import { ResourceForm } from '@/components/admin/ResourceForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '添加资源 - 后台' }

export default function NewResourcePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-6">添加资源</h1>
      <ResourceForm />
    </div>
  )
}
