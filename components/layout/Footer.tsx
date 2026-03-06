import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="text-blue-600">教育</span>
              <span className="text-gray-800">导航</span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs">
              整合教育学核心资源链接，涵盖期刊数据库、数据分析方法、学习平台等，助力教育研究与实践。
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-3">快速导航</h3>
            <ul className="flex flex-col gap-2 text-sm text-gray-500">
              <li><Link href="/resources" className="hover:text-gray-800">资源导航</Link></li>
              <li><Link href="/articles" className="hover:text-gray-800">方法教程</Link></li>
              <li><Link href="/categories/data-analysis" className="hover:text-gray-800">数据分析</Link></li>
              <li><Link href="/search" className="hover:text-gray-800">搜索</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-3">参与贡献</h3>
            <ul className="flex flex-col gap-2 text-sm text-gray-500">
              <li><Link href="/submit" className="hover:text-gray-800">提交资源</Link></li>
              <li><Link href="/login" className="hover:text-gray-800">登录/注册</Link></li>
              <li><Link href="/dashboard" className="hover:text-gray-800">我的收藏</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} 教育导航. 整合教育学优质资源.
          </p>
          <p className="text-xs text-gray-400">
            资源仅供学习参考，版权归原作者所有
          </p>
        </div>
      </div>
    </footer>
  )
}
