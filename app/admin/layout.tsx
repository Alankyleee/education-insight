import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LayoutDashboard, Inbox, FileText, BookOpen, Tag, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const adminNav = [
  { href: '/admin', icon: LayoutDashboard, label: '概览' },
  { href: '/admin/submissions', icon: Inbox, label: '待审核' },
  { href: '/admin/resources', icon: BookOpen, label: '资源管理' },
  { href: '/admin/articles', icon: FileText, label: '文章管理' },
  { href: '/admin/categories', icon: Tag, label: '分类管理' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/admin')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as { role: string } | null
  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r bg-gray-50 p-4">
        <div className="flex items-center gap-2 mb-6 px-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-gray-800">后台管理</span>
        </div>
        <nav className="flex flex-col gap-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-md text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
