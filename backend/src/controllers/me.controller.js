import { ok } from '../core/ApiResponse.js';
import * as meService from '../services/me.service.js';

export const getMe = async (req, res) => ok(res, await meService.getMe(req.profile, req.user.id));

export default { getMe };
