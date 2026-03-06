import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResourceCard } from '@/components/resources/ResourceCard'
import { ArticleCard } from '@/components/articles/ArticleCard'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('name, description').eq('slug', slug).single()
  if (!data) return { title: '分类未找到' }
  return { title: data.name, description: data.description ?? undefined }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*, parent:parent_id(name, slug)')
    .eq('slug', slug)
    .single()

  if (!category) notFound()

  const [{ data: resources }, { data: articles }, { data: subCategories }] = await Promise.all([
    supabase
      .from('resources')
      .select('*, categories(name, slug)')
      .eq('category_id', category.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(24),
    supabase
      .from('articles')
      .select('*, categories(name, slug)')
      .eq('category_id', category.id)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('categories')
      .select('*')
      .eq('parent_id', category.id)
      .eq('is_active', true)
      .order('sort_order'),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          {(category as any).parent && (
            <>
              <a href={`/categories/${(category as any).parent.slug}`} className="hover:text-blue-600">
                {(category as any).parent.name}
              </a>
              <span>/</span>
            </>
          )}
          <span className="text-gray-800">{category.name}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {category.icon && <span>{category.icon}</span>}
          {category.name}
        </h1>
        {category.description && <p className="text-gray-500 text-sm mt-1">{category.description}</p>}
      </div>

      {/* Sub-categories */}
      {subCategories && subCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {subCategories.map((sub) => (
            <a
              key={sub.id}
              href={`/categories/${sub.slug}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white text-sm hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              {sub.icon && <span>{sub.icon}</span>}
              {sub.name}
            </a>
          ))}
        </div>
      )}

      <Tabs defaultValue="resources">
        <TabsList className="mb-6">
          <TabsTrigger value="resources">资源 ({resources?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="articles">文章 ({articles?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="resources">
          {!resources?.length ? (
            <div className="text-center py-12 text-gray-400">该分类暂无资源</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {resources.map((r) => <ResourceCard key={r.id} resource={r as any} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="articles">
          {!articles?.length ? (
            <div className="text-center py-12 text-gray-400">该分类暂无文章</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((a) => <ArticleCard key={a.id} article={a as any} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
