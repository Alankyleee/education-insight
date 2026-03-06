import { notFound } from 'next/navigation'
import { ResourceForm } from '@/components/admin/ResourceForm'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface PageProps { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: '编辑资源 - 后台' }

export default async function EditResourcePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: resource } = await supabase
    .from('resources')
    .select('id, title, url, description, category_id, thumbnail_url, is_featured, is_approved')
    .eq('id', id)
    .single()

  if (!resource) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold mb-6">编辑资源</h1>
      <ResourceForm resource={resource} />
    </div>
  )
}
