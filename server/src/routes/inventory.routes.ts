import { Router } from 'express';
import { getItems, createItem, updateItem, deleteItem, bulkImport } from '../controllers/inventory.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { inventoryItemSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/:projectId/sites/:siteId/items', getItems);
router.post('/:projectId/sites/:siteId/items', validate(inventoryItemSchema), createItem);
router.post('/:projectId/sites/:siteId/items/bulk', bulkImport);
router.put('/:projectId/sites/:siteId/items/:id', validate(inventoryItemSchema), updateItem);
router.delete('/:projectId/sites/:siteId/items/:id', deleteItem);

export default router;
