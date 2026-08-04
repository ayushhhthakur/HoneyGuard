import { ok, created } from '../core/ApiResponse.js';
import { getClientIp } from '../services/metadata.service.js';
import * as categoryService from '../services/category.service.js';

export const list = async (req, res) => ok(res, await categoryService.listCategories(req.org.id));

export const create = async (req, res) =>
  created(
    res,
    await categoryService.createCategory({
      org: req.org,
      actor: { id: req.user.id, email: req.user.email },
      body: req.body,
      ipAddress: getClientIp(req),
    })
  );

export const remove = async (req, res) =>
  ok(
    res,
    await categoryService.deleteCategory({
      org: req.org,
      actor: { id: req.user.id },
      categoryId: req.params.id,
      ipAddress: getClientIp(req),
    })
  );

export default { list, create, remove };
