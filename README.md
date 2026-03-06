# 教育导航 - Education Insight

教育学资源聚合平台。整合教育学核心资源链接，提供数据分析方法站内文章，支持用户收藏、评分与评论，管理员审核用户提交的资源。

## 功能特性

- 分类资源导航（外部链接）
- 站内 Markdown 文章（数据分析方法/课程）
- 全文搜索（PostgreSQL GIN 索引）
- 匿名提交资源（Cloudflare Turnstile 验证码保护）
- 用户收藏、评分（1-5 星）、评论
- 管理员后台：审核提交、管理资源/文章/分类

## 技术栈

- **框架**: Next.js (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **数据库 + 认证**: Supabase (PostgreSQL + Auth)
- **验证码**: Cloudflare Turnstile
- **部署**: Vercel

---

## 快速开始

### 1. 克隆仓库并安装依赖

```bash
git clone <your-repo-url>
cd education-insight
npm install
```

### 2. 创建 Supabase 项目

1. 前往 [supabase.com](https://supabase.com) 创建新项目
2. 进入 **SQL Editor**，依次按顺序执行以下迁移文件：
   - `supabase/migrations/001_initial_schema.sql` — 创建所有表、函数、索引
   - `supabase/migrations/002_rls_policies.sql` — 配置行级安全策略
   - `supabase/migrations/003_seed_categories.sql` — 初始化分类和标签数据
3. 在 **Settings > API** 页面复制以下值备用：
   - `Project URL`
   - `anon public` key
   - `service_role` key（保密，仅服务端使用）

### 3. 配置 Cloudflare Turnstile

1. 前往 [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) 创建站点
2. 域名填写你的域名（本地测试可填 `localhost`）
3. 类型选择 **Managed**（推荐）
4. 复制 **Site Key** 和 **Secret Key**

### 4. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填入对应值：

```bash
cp .env.example .env.local
```

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAA...
TURNSTILE_SECRET_KEY=0x4AAAAAAA...

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

---

## 设置第一个管理员账号

1. 在网站注册一个账号（或通过 Supabase Auth 创建）
2. 进入 Supabase Dashboard > **Table Editor** > `profiles` 表
3. 找到你的用户记录，将 `role` 字段从 `user` 改为 `admin`
4. 登录后即可访问 `/admin` 后台

---

## 部署到 Vercel

### 方式一：Vercel CLI

```bash
npm i -g vercel
vercel
```

### 方式二：GitHub 集成

1. 将代码推送到 GitHub 仓库
2. 在 [vercel.com](https://vercel.com) 导入该仓库
3. 在 **Environment Variables** 中配置所有 `.env.local` 中的变量
4. 点击 **Deploy**

### 部署后配置

1. 将 `NEXT_PUBLIC_SITE_URL` 更新为你的 Vercel 生产域名
2. 在 Supabase Dashboard > **Authentication > URL Configuration** 中添加：
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: `https://your-domain.vercel.app/auth/callback`
3. 在 Cloudflare Turnstile 站点设置中添加生产域名

---

## （可选）生成精确的 TypeScript 类型

项目目前使用无泛型的 Supabase 客户端以兼容 PostgREST v12。连接真实 Supabase 项目后，可生成精确类型：

```bash
npx supabase login
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
```

生成后，如果类型正常，可将 `Database` 泛型恢复到 `lib/supabase/client.ts` 和 `lib/supabase/server.ts`。

---

## 项目结构

```
education-insight/
├── app/
│   ├── page.tsx                    # 首页
│   ├── resources/                  # 资源列表 + 详情
│   ├── articles/                   # 文章列表 + 详情（Markdown）
│   ├── categories/[slug]/          # 分类页
│   ├── search/                     # 全文搜索
│   ├── submit/                     # 匿名提交表单
│   ├── (auth)/login|register       # 登录/注册
│   ├── dashboard/bookmarks         # 用户收藏页（需登录）
│   ├── admin/                      # 管理后台（需 admin 角色）
│   └── api/                        # API 路由
├── components/
│   ├── layout/                     # Navbar、Footer
│   ├── resources/                  # ResourceCard、ResourceFilter
│   ├── articles/                   # ArticleCard、MarkdownRenderer
│   ├── interactions/               # BookmarkButton、RatingWidget、CommentSection
│   └── admin/                      # ArticleEditor（含 Markdown 编辑器）
├── lib/
│   ├── supabase/client.ts          # 浏览器端 Supabase 客户端
│   ├── supabase/server.ts          # 服务端 Supabase 客户端
│   ├── turnstile.ts                # Turnstile 服务端验证
│   └── utils.ts                    # 工具函数
├── middleware.ts                   # 路由鉴权守卫
└── supabase/migrations/            # 数据库迁移 SQL
```

---

## 环境变量说明

| 变量 | 说明 | 是否公开 |
|------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | 是 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名 Key | 是 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色 Key（绕过 RLS） | **否** |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile 站点 Key | 是 |
| `TURNSTILE_SECRET_KEY` | Turnstile 密钥 | **否** |
| `NEXT_PUBLIC_SITE_URL` | 网站完整 URL | 是 |
