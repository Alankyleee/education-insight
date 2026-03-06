// Auto-generate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
// This is a placeholder with core Row types until you connect your Supabase project.
// Insert/Update types use Record<string, unknown> to avoid strict type mismatches.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: AnyRecord
        Update: AnyRecord
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          parent_id: number | null
          icon: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: AnyRecord
        Update: AnyRecord
      }
      resources: {
        Row: {
          id: string
          title: string
          url: string
          description: string | null
          category_id: number | null
          thumbnail_url: string | null
          is_featured: boolean
          is_approved: boolean
          submitted_by: string | null
          approved_by: string | null
          view_count: number
          avg_rating: number
          rating_count: number
          created_at: string
          updated_at: string
        }
        Insert: AnyRecord
        Update: AnyRecord
      }
      articles: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          category_id: number | null
          cover_image: string | null
          is_published: boolean
          author_id: string | null
          view_count: number
          avg_rating: number
          rating_count: number
          created_at: string
          updated_at: string
        }
        Insert: AnyRecord
        Update: AnyRecord
      }
      tags: {
        Row: { id: number; name: string; slug: string }
        Insert: AnyRecord
        Update: AnyRecord
      }
      resource_tags: {
        Row: { resource_id: string; tag_id: number }
        Insert: AnyRecord
        Update: AnyRecord
      }
      article_tags: {
        Row: { article_id: string; tag_id: number }
        Insert: AnyRecord
        Update: AnyRecord
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          resource_id: string | null
          article_id: string | null
          created_at: string
        }
        Insert: AnyRecord
        Update: AnyRecord
      }
      ratings: {
        Row: {
          id: string
          user_id: string
          resource_id: string | null
          article_id: string | null
          score: number
          created_at: string
          updated_at: string
        }
        Insert: AnyRecord
        Update: AnyRecord
      }
      comments: {
        Row: {
          id: string
          user_id: string
          resource_id: string | null
          article_id: string | null
          content: string
          is_approved: boolean
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: AnyRecord
        Update: AnyRecord
      }
      submissions: {
        Row: {
          id: string
          title: string
          url: string
          description: string | null
          category_id: number | null
          submitter_name: string | null
          submitter_email: string | null
          status: 'pending' | 'approved' | 'rejected'
          reject_reason: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: AnyRecord
        Update: AnyRecord
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Views: Record<string, any>
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean }
      approve_submission: {
        Args: AnyRecord
        Returns: string
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Enums: Record<string, any>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Category = Tables<'categories'>
export type Resource = Tables<'resources'>
export type Article = Tables<'articles'>
export type Profile = Tables<'profiles'>
export type Submission = Tables<'submissions'>
export type Comment = Tables<'comments'>
export type Bookmark = Tables<'bookmarks'>
export type Rating = Tables<'ratings'>
export type Tag = Tables<'tags'>
