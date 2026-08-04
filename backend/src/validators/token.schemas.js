import { z } from 'zod';
import { TOKEN_CATEGORIES } from '../config/constants.js';

const legacyCategoryEnum = z.enum([
  TOKEN_CATEGORIES.IMAGE,
  TOKEN_CATEGORIES.AWS,
  TOKEN_CATEGORIES.FINANCIAL,
  TOKEN_CATEGORIES.HEALTHCARE,
]);

// multipart/form-data fields all arrive as strings — this schema validates
// shape/length, not JS type, since multer has already parsed the body by
// the time this runs. `tokenType` is the modern field (one of the 27
// registry keys, see GET /tokens/types); `category` is kept for backward
// compatibility with the original four-category flow.
//
// Type-specific optional fields are individually enumerated (not an open
// passthrough) — across the whole registry there are only ever two:
// `dbEngine` (database_credentials) and `format` (business-document
// types). Everything else generates with zero extra input.
export const createTokenSchema = {
  body: z.object({
    tokenName: z.string().trim().min(1, 'Token name is required').max(200),
    description: z.string().trim().max(1000).optional().default(''),
    tokenType: z.string().trim().max(60).optional(),
    category: z.union([legacyCategoryEnum, z.string().trim().max(60)]).optional(),
    tags: z
      .preprocess((val) => {
        if (typeof val === 'string') {
          try {
            return JSON.parse(val);
          } catch {
            return [val];
          }
        }
        return val;
      }, z.array(z.string().trim().max(40)).max(20))
      .optional()
      .default([]),

    // legacy fields (original AWS/financial/healthcare flow) — still
    // accepted for backward compatibility, silently unused by types that
    // don't need them.
    awsRegion: z.string().trim().max(50).optional(),
    awsService: z.string().trim().max(50).optional(),
    financialType: z.string().trim().max(50).optional(),
    healthcareSystem: z.string().trim().max(50).optional(),
    patientId: z.string().trim().max(50).optional(),

    // type-specific fields for the new registry types
    dbEngine: z.enum(['postgresql', 'mysql', 'mongodb', 'mssql']).optional(),
    format: z.enum(['pdf', 'docx', 'xlsx']).optional(),
  }),
};

export const tokenParamSchema = {
  params: z.object({ token: z.string().trim().min(1).max(300) }),
};

export const rotateTokenSchema = {
  body: z.object({ reason: z.string().trim().max(300).optional() }),
};

export const updateTagsSchema = {
  body: z.object({ tags: z.array(z.string().trim().max(40)).max(20) }),
};

export const exportTokensQuerySchema = {
  query: z.object({ format: z.enum(['json', 'csv']).default('json') }),
};

export default { createTokenSchema, tokenParamSchema, rotateTokenSchema, updateTagsSchema, exportTokensQuerySchema };
