import { TOKEN_CATEGORIES } from '../config/constants.js';
import { BadRequestError } from '../core/errors.js';

const generateAwsToken = (region, service) => {
  const timestamp = Date.now().toString(36);
  const servicePrefix = (service || 'xx').substring(0, 2).toUpperCase();
  return `AKIA${servicePrefix}${timestamp}X${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
};

const generateFinancialToken = (type) => {
  switch (type) {
    case 'credit_card':
      return `4532${Math.random().toString().slice(2, 6)}${Math.random().toString().slice(2, 6)}${Math.random().toString().slice(2, 6)}`;
    case 'bank_account':
      return `BANK${Math.random().toString().slice(2, 14)}`;
    case 'api_key':
      return `fin_live_${Math.random().toString(36).substring(2, 15)}`;
    default:
      return `FIN_${Math.random().toString(36).substring(2, 15)}`;
  }
};

const generateHealthcareToken = (system, patientIdFormat) => {
  const timestamp = Date.now().toString(36);
  if (patientIdFormat) return patientIdFormat.replace(/#/g, () => Math.floor(Math.random() * 10));
  return `${(system || 'SYS').toUpperCase()}_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
};

const generateImageToken = () => `img_${Math.random().toString(36).substring(2, 15)}`;

/**
 * Single entry point for "generate a honeytoken value for this category" —
 * keeps the per-category branching in one place instead of duplicated across
 * a controller/service/edge-function.
 */
export const generateTokenValue = (category, fields = {}) => {
  switch (category) {
    case TOKEN_CATEGORIES.IMAGE:
      return generateImageToken();
    case TOKEN_CATEGORIES.AWS:
      if (!fields.awsRegion || !fields.awsService) {
        throw new BadRequestError('AWS region and service are required');
      }
      return generateAwsToken(fields.awsRegion, fields.awsService);
    case TOKEN_CATEGORIES.FINANCIAL:
      if (!fields.financialType) throw new BadRequestError('Financial type is required');
      return generateFinancialToken(fields.financialType);
    case TOKEN_CATEGORIES.HEALTHCARE:
      if (!fields.healthcareSystem) throw new BadRequestError('Healthcare system is required');
      return generateHealthcareToken(fields.healthcareSystem, fields.patientId);
    default:
      throw new BadRequestError('Invalid category');
  }
};
