import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/sonner'
import { createClient } from '@/lib/supabase/server'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: '教育导航 - 教育学资源聚合平台',
    template: '%s | 教育导航',
  },
  description: '整合教育学核心资源，涵盖期刊数据库、数据分析方法、学习平台等优质资源导航',
  keywords: ['教育学', '教育资源', '数据分析', '期刊数据库', '教育研究'],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '教育导航',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <html lang="zh-CN">
      <body className={`${geist.className} antialiased`}>
        <Navbar user={user} profile={profile} />
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
