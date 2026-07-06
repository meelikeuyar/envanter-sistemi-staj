import { Router } from 'express';
import { getSites, createSite, updateSite, deleteSite } from '../controllers/site.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { siteSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/:projectId/sites', getSites);
router.post('/:projectId/sites', validate(siteSchema), createSite);
router.put('/:projectId/sites/:id', validate(siteSchema), updateSite);
router.delete('/:projectId/sites/:id', deleteSite);

export default router;
