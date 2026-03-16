import { defineCollection, z } from 'astro:content';

const work = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    featured: z.boolean().default(false),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    role: z.string().optional(),
    company: z.string().optional(),
    year: z.string().optional(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    featured: z.boolean().default(false),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    url: z.string().url().optional(),
    github: z.string().url().optional(),
  }),
});

const thoughts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    featured: z.boolean().default(false),
    cover: z.string().optional(),
  }),
});

export const collections = { work, projects, thoughts };
