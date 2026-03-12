import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	type: 'content',
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
        tags: z.array(z.string()).optional(),
	}),
});

const projects = defineCollection({
    type: 'content',
    schema: ({ image }) => z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        heroImage: image().optional(),
        projectUrl: z.string().optional(),
        repoUrl: z.string().optional(),
        stack: z.array(z.string()),
        tags: z.array(z.string()).optional(),
        role: z.string().optional(),
        timeline: z.string().optional(),
        category: z.string().optional(),
        featured: z.boolean().optional(),
        highlights: z.array(z.object({
            label: z.string(),
            value: z.string(),
        })).optional(),
        sections: z.array(z.object({
            id: z.string(),
            title: z.string(),
            icon: z.string().optional(),
        })).optional(),
    }),
});

export const collections = { blog, projects };
