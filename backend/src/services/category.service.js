import { categoriesRepository } from '../repositories/categories.repository.js';
import { recordAudit } from './audit.service.js';
import { AUDIT_ACTIONS } from '../config/constants.js';
import { ConflictError } from '../core/errors.js';
import { sanitizeText, sanitizeSlugSegment } from '../core/sanitize.js';

export const listCategories = (orgId) => categoriesRepository.listByOrg(orgId);

export const createCategory = async ({ org, actor, body, ipAddress }) => {
  const category = sanitizeSlugSegment(body.category);
  const description = sanitizeText(body.description, { maxLength: 300 });

  try {
    const row = await categoriesRepository.create({ org_id: org.id, category, description, created_by: actor.id });

    recordAudit({
      orgId: org.id,
      actorId: actor.id,
      action: AUDIT_ACTIONS.CATEGORY_CREATED,
      targetType: 'category',
      targetId: row.id,
      metadata: { category },
      ipAddress,
    });

    return row;
  } catch (error) {
    if (error.details?.dbCode === '23505') throw new ConflictError('That category already exists');
    throw error;
  }
};

export const seedDefaultCategories = (orgId, actorId) =>
  categoriesRepository.createMany(
    ['image', 'aws', 'financial', 'healthcare'].map((category) => ({ org_id: orgId, category, created_by: actorId }))
  );

export const deleteCategory = async ({ org, actor, categoryId, ipAddress }) => {
  await categoriesRepository.deleteByIdInOrg(org.id, categoryId);

  recordAudit({
    orgId: org.id,
    actorId: actor.id,
    action: AUDIT_ACTIONS.CATEGORY_DELETED,
    targetType: 'category',
    targetId: categoryId,
    ipAddress,
  });

  return { message: 'Category deleted' };
};

export default { listCategories, createCategory, seedDefaultCategories, deleteCategory };
