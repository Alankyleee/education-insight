import { ArticleEditor } from '@/components/admin/ArticleEditor'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '写文章 - 后台' }

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">写文章</h1>
      <ArticleEditor />
    </div>
  )
}
