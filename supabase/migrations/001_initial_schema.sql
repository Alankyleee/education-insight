-- ============================================================
-- Education-Insight: Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE public.categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id   INT REFERENCES public.categories(id) ON DELETE SET NULL,
  icon        TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TAGS
-- ============================================================
CREATE TABLE public.tags (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE,
  slug  TEXT NOT NULL UNIQUE
);

-- ============================================================
-- RESOURCES (external links)
-- ============================================================
CREATE TABLE public.resources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  url           TEXT NOT NULL,
  description   TEXT,
  category_id   INT REFERENCES public.categories(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved   BOOLEAN NOT NULL DEFAULT TRUE,
  submitted_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  view_count    INT NOT NULL DEFAULT 0,
  avg_rating    NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count  INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search index for resources
ALTER TABLE public.resources
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) STORED;
CREATE INDEX resources_search_idx ON public.resources USING GIN(search_vector);
CREATE INDEX resources_category_idx ON public.resources(category_id);
CREATE INDEX resources_approved_idx ON public.resources(is_approved);

-- Resource tags (many-to-many)
CREATE TABLE public.resource_tags (
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  tag_id      INT  REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);

-- ============================================================
-- ARTICLES (internal Markdown content)
-- ============================================================
CREATE TABLE public.articles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  content       TEXT NOT NULL DEFAULT '',
  excerpt       TEXT,
  category_id   INT REFERENCES public.categories(id) ON DELETE SET NULL,
  cover_image   TEXT,
  is_published  BOOLEAN NOT NULL DEFAULT FALSE,
  author_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  view_count    INT NOT NULL DEFAULT 0,
  avg_rating    NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count  INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search index for articles
ALTER TABLE public.articles
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, ''))
  ) STORED;
CREATE INDEX articles_search_idx ON public.articles USING GIN(search_vector);
CREATE INDEX articles_published_idx ON public.articles(is_published);

-- Article tags (many-to-many)
CREATE TABLE public.article_tags (
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id     INT  REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- ============================================================
-- BOOKMARKS
-- ============================================================
CREATE TABLE public.bookmarks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  article_id  UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT one_bookmark_target CHECK (
    (resource_id IS NOT NULL AND article_id IS NULL) OR
    (resource_id IS NULL AND article_id IS NOT NULL)
  ),
  UNIQUE (user_id, resource_id),
  UNIQUE (user_id, article_id)
);

-- ============================================================
-- RATINGS
-- ============================================================
CREATE TABLE public.ratings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  article_id  UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  score       SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT one_rating_target CHECK (
    (resource_id IS NOT NULL AND article_id IS NULL) OR
    (resource_id IS NULL AND article_id IS NOT NULL)
  ),
  UNIQUE (user_id, resource_id),
  UNIQUE (user_id, article_id)
);

-- Trigger to update avg_rating on resources
CREATE OR REPLACE FUNCTION public.update_resource_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.resource_id IS NOT NULL THEN
    UPDATE public.resources
    SET
      avg_rating   = (SELECT ROUND(AVG(score)::numeric, 2) FROM public.ratings WHERE resource_id = NEW.resource_id),
      rating_count = (SELECT COUNT(*) FROM public.ratings WHERE resource_id = NEW.resource_id),
      updated_at   = NOW()
    WHERE id = NEW.resource_id;
  ELSIF NEW.article_id IS NOT NULL THEN
    UPDATE public.articles
    SET
      avg_rating   = (SELECT ROUND(AVG(score)::numeric, 2) FROM public.ratings WHERE article_id = NEW.article_id),
      rating_count = (SELECT COUNT(*) FROM public.ratings WHERE article_id = NEW.article_id),
      updated_at   = NOW()
    WHERE id = NEW.article_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_rating_upsert
  AFTER INSERT OR UPDATE ON public.ratings
  FOR EACH ROW EXECUTE PROCEDURE public.update_resource_rating();

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE public.comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  article_id  UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT TRUE,
  parent_id   UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT one_comment_target CHECK (
    (resource_id IS NOT NULL AND article_id IS NULL) OR
    (resource_id IS NULL AND article_id IS NOT NULL)
  )
);

-- ============================================================
-- SUBMISSIONS (anonymous user submissions awaiting review)
-- ============================================================
CREATE TABLE public.submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  url             TEXT NOT NULL,
  description     TEXT,
  category_id     INT REFERENCES public.categories(id) ON DELETE SET NULL,
  submitter_name  TEXT,
  submitter_email TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reject_reason   TEXT,
  reviewed_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  ip_address      INET,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RPC: approve submission atomically (update status + create resource)
CREATE OR REPLACE FUNCTION public.approve_submission(
  p_submission_id UUID,
  p_admin_id      UUID,
  p_title         TEXT,
  p_description   TEXT,
  p_category_id   INT
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_resource_id UUID;
  v_url TEXT;
BEGIN
  -- Get URL from submission
  SELECT url INTO v_url FROM public.submissions WHERE id = p_submission_id;

  -- Insert resource
  INSERT INTO public.resources (title, url, description, category_id, is_approved, approved_by)
  VALUES (p_title, v_url, p_description, p_category_id, TRUE, p_admin_id)
  RETURNING id INTO v_resource_id;

  -- Update submission status
  UPDATE public.submissions
  SET status = 'approved', reviewed_by = p_admin_id, reviewed_at = NOW()
  WHERE id = p_submission_id;

  RETURN v_resource_id;
END;
$$;
