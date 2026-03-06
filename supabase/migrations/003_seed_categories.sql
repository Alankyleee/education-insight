-- ============================================================
-- Education-Insight: Seed Data - Categories
-- ============================================================

-- Parent categories (教育学一级分类)
INSERT INTO public.categories (name, slug, description, icon, sort_order) VALUES
  ('期刊数据库', 'journals', '教育学核心期刊与论文数据库资源', '📚', 1),
  ('数据分析', 'data-analysis', '教育数据分析方法、工具与课程', '📊', 2),
  ('学习平台', 'learning-platforms', '在线学习与课程平台', '🎓', 3),
  ('学术工具', 'academic-tools', '学术写作、文献管理与研究工具', '🔬', 4),
  ('教育政策', 'education-policy', '教育政策文件与研究报告', '📋', 5),
  ('测评工具', 'assessment', '教育测量与评价工具资源', '📝', 6),
  ('开放资源', 'open-resources', '开放教育资源（OER）与公开课', '🌐', 7),
  ('专业社群', 'communities', '教育学研究者与从业者社群', '👥', 8);

-- Sub-categories for 数据分析
INSERT INTO public.categories (name, slug, description, parent_id, icon, sort_order) VALUES
  ('统计分析', 'statistical-analysis', 'SPSS、R、SAS等统计分析工具与方法', (SELECT id FROM public.categories WHERE slug='data-analysis'), '📈', 1),
  ('质性研究', 'qualitative-research', 'NVivo、质性编码等质性研究方法', (SELECT id FROM public.categories WHERE slug='data-analysis'), '🔍', 2),
  ('结构方程模型', 'sem', 'SEM、路径分析、验证性因子分析', (SELECT id FROM public.categories WHERE slug='data-analysis'), '🕸️', 3),
  ('教育大数据', 'educational-big-data', '学习分析、教育数据挖掘工具与资源', (SELECT id FROM public.categories WHERE slug='data-analysis'), '💾', 4),
  ('可视化工具', 'visualization', '数据可视化与图表制作工具', (SELECT id FROM public.categories WHERE slug='data-analysis'), '🎨', 5);

-- Sub-categories for 期刊数据库
INSERT INTO public.categories (name, slug, description, parent_id, icon, sort_order) VALUES
  ('中文期刊', 'chinese-journals', '中国知网、万方、维普等中文期刊库', (SELECT id FROM public.categories WHERE slug='journals'), '🇨🇳', 1),
  ('英文期刊', 'english-journals', 'ERIC、JSTOR、Springer等英文期刊库', (SELECT id FROM public.categories WHERE slug='journals'), '🌍', 2);

-- Sample tags
INSERT INTO public.tags (name, slug) VALUES
  ('免费', 'free'),
  ('付费', 'paid'),
  ('开源', 'open-source'),
  ('中文', 'chinese'),
  ('英文', 'english'),
  ('工具', 'tool'),
  ('课程', 'course'),
  ('数据库', 'database'),
  ('方法论', 'methodology'),
  ('软件', 'software');
