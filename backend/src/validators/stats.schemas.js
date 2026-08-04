import { z } from 'zod';

export const logsQuerySchema = {
  query: z.object({
    timeRange: z.enum(['1h', '24h', '7d', '30d']).default('24h'),
    level: z.enum(['success', 'error', 'warning', 'info']).optional(),
  }),
};

export default { logsQuerySchema };
