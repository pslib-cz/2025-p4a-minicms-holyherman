import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(300, "Description must be under 300 characters").optional().default(""),
  content: z.string().min(1, "Content is required"),
  published: z.boolean().default(false),
  concept: z.boolean().default(true),
  tags: z.array(z.string()).default([]), // array of tag IDs
});

export const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(30, "Tag name is too long"),
});
