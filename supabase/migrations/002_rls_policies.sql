-- ============================================================
-- Education-Insight: Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Admin check helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  )
$$;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- CATEGORIES (public read, admin write)
-- ============================================================
CREATE POLICY "categories_select_public" ON public.categories
  FOR SELECT USING (TRUE);

CREATE POLICY "categories_insert_admin" ON public.categories
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "categories_update_admin" ON public.categories
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "categories_delete_admin" ON public.categories
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- TAGS (public read, admin write)
-- ============================================================
CREATE POLICY "tags_select_public" ON public.tags
  FOR SELECT USING (TRUE);

CREATE POLICY "tags_insert_admin" ON public.tags
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "tags_update_admin" ON public.tags
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "tags_delete_admin" ON public.tags
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- RESOURCES
-- ============================================================
CREATE POLICY "resources_select_approved" ON public.resources
  FOR SELECT USING (is_approved = TRUE OR public.is_admin());

CREATE POLICY "resources_insert_admin" ON public.resources
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "resources_update_admin" ON public.resources
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "resources_delete_admin" ON public.resources
  FOR DELETE USING (public.is_admin());

-- Resource tags
CREATE POLICY "resource_tags_select_public" ON public.resource_tags
  FOR SELECT USING (TRUE);

CREATE POLICY "resource_tags_admin" ON public.resource_tags
  FOR ALL USING (public.is_admin());

-- ============================================================
-- ARTICLES
-- ============================================================
CREATE POLICY "articles_select_published" ON public.articles
  FOR SELECT USING (is_published = TRUE OR public.is_admin());

CREATE POLICY "articles_insert_admin" ON public.articles
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "articles_update_admin" ON public.articles
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "articles_delete_admin" ON public.articles
  FOR DELETE USING (public.is_admin());

-- Article tags
CREATE POLICY "article_tags_select_public" ON public.article_tags
  FOR SELECT USING (TRUE);

CREATE POLICY "article_tags_admin" ON public.article_tags
  FOR ALL USING (public.is_admin());

-- ============================================================
-- BOOKMARKS (user owns their own)
-- ============================================================
CREATE POLICY "bookmarks_select_own" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bookmarks_insert_own" ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookmarks_delete_own" ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- RATINGS (public read, authenticated write)
-- ============================================================
CREATE POLICY "ratings_select_public" ON public.ratings
  FOR SELECT USING (TRUE);

CREATE POLICY "ratings_insert_auth" ON public.ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ratings_update_own" ON public.ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE POLICY "comments_select_approved" ON public.comments
  FOR SELECT USING (is_approved = TRUE OR auth.uid() = user_id OR public.is_admin());

CREATE POLICY "comments_insert_auth" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_update_own" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "comments_delete_own" ON public.comments
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================
-- SUBMISSIONS
-- ============================================================
-- Anonymous insert (captcha verified server-side)
CREATE POLICY "submissions_insert_public" ON public.submissions
  FOR INSERT WITH CHECK (TRUE);

-- Only admin can read and update
CREATE POLICY "submissions_select_admin" ON public.submissions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "submissions_update_admin" ON public.submissions
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "submissions_delete_admin" ON public.submissions
  FOR DELETE USING (public.is_admin());
