import { Router } from 'express';
import { getProjects, createProject, updateProject, deleteProject } from '../controllers/project.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { projectSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.post('/', validate(projectSchema), createProject);
router.put('/:id', validate(projectSchema), updateProject);
router.delete('/:id', deleteProject);

export default router;
