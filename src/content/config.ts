import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // 只加载「年-月-日」开头的笔记文件（如 260908-xxx.md）。
  // 主题自带的示例文章（230918-*、first-post 等）不在匹配范围内，不会出现在站点上。
  loader: glob({ pattern: '2[6-9]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    categories: z.array(z.string()).default(['others']),
    tags: z.array(z.string()).default(['others']),
    authors: z.array(z.string()).default(['Jiahui Ge']),
  }),
});

export const collections = { blog };
