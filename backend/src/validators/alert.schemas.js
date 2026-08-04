import { z } from 'zod';
import { ALERT_STATUSES, ALERT_SEVERITIES } from '../config/constants.js';

export const listAlertsQuerySchema = {
  query: z.object({
    status: z.nativeEnum(ALERT_STATUSES).optional(),
    severity: z.nativeEnum(ALERT_SEVERITIES).optional(),
  }),
};

export const alertIdParamSchema = {
  params: z.object({ id: z.string().uuid('Invalid alert id') }),
};

export const updateAlertStatusSchema = {
  body: z.object({
    status: z.nativeEnum(ALERT_STATUSES),
  }),
};

export default { listAlertsQuerySchema, alertIdParamSchema, updateAlertStatusSchema };
