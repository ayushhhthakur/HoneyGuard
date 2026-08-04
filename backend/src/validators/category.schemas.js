import { z } from 'zod';

export const createCategorySchema = {
  body: z.object({
    category: z.string().trim().min(1, 'Category is required').max(60),
    description: z.string().trim().max(300).optional().default(''),
  }),
};

export const categoryIdParamSchema = {
  params: z.object({ id: z.string().uuid('Invalid category id') }),
};

export default { createCategorySchema, categoryIdParamSchema };
