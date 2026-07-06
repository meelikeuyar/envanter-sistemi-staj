import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { InventoryItem } from '../models/InventoryItem';
import { Site } from '../models/Site';
import { Project } from '../models/Project';

async function verifySiteAccess(req: AuthRequest): Promise<string | null> {
  const project = await Project.findOne({ _id: req.params.projectId, owner: req.userId });
  if (!project) return null;

  const site = await Site.findOne({ _id: req.params.siteId, project: project._id });
  if (!site) return null;

  return site.id;
}

export async function getItems(req: AuthRequest, res: Response): Promise<void> {
  try {
    const siteId = await verifySiteAccess(req);
    if (!siteId) {
      res.status(404).json({ message: 'Site bulunamadı' });
      return;
    }

    const { search, page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));

    const filter: any = { site: siteId };
    if (search) {
      const regex = new RegExp(search as string, 'i');
      filter.$or = [{ name: regex }, { serialNumber: regex }, { ipAddress: regex }];
    }

    const [items, total] = await Promise.all([
      InventoryItem.find(filter)
        .populate('addedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      InventoryItem.countDocuments(filter),
    ]);

    res.json({
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch {
    res.status(500).json({ message: 'Envanter yüklenirken hata oluştu' });
  }
}

export async function createItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const siteId = await verifySiteAccess(req);
    if (!siteId) {
      res.status(404).json({ message: 'Site bulunamadı' });
      return;
    }

    const item = await InventoryItem.create({
      ...req.body,
      site: siteId,
      addedBy: req.userId,
    });

    res.status(201).json(item);
  } catch {
    res.status(500).json({ message: 'Kayıt oluşturulurken hata oluştu' });
  }
}

export async function updateItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const siteId = await verifySiteAccess(req);
    if (!siteId) {
      res.status(404).json({ message: 'Site bulunamadı' });
      return;
    }

    const item = await InventoryItem.findOneAndUpdate(
      { _id: req.params.id, site: siteId },
      req.body,
      { new: true }
    );

    if (!item) {
      res.status(404).json({ message: 'Kayıt bulunamadı' });
      return;
    }
    res.json(item);
  } catch {
    res.status(500).json({ message: 'Kayıt güncellenirken hata oluştu' });
  }
}

export async function deleteItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const siteId = await verifySiteAccess(req);
    if (!siteId) {
      res.status(404).json({ message: 'Site bulunamadı' });
      return;
    }

    const item = await InventoryItem.findOneAndDelete({ _id: req.params.id, site: siteId });
    if (!item) {
      res.status(404).json({ message: 'Kayıt bulunamadı' });
      return;
    }
    res.json({ message: 'Kayıt silindi' });
  } catch {
    res.status(500).json({ message: 'Kayıt silinirken hata oluştu' });
  }
}

export async function bulkImport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const siteId = await verifySiteAccess(req);
    if (!siteId) {
      res.status(404).json({ message: 'Site bulunamadı' });
      return;
    }

    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'Geçerli envanter verileri gerekli' });
      return;
    }

    const docs = items.map((item: any) => ({
      name: String(item.name || '').trim(),
      ipAddress: String(item.ipAddress || '').trim(),
      serialNumber: String(item.serialNumber || '').trim(),
      site: siteId,
      addedBy: req.userId,
    })).filter((d) => d.name.length > 0);

    const created = await InventoryItem.insertMany(docs);
    res.status(201).json({ message: `${created.length} kayıt eklendi`, count: created.length });
  } catch {
    res.status(500).json({ message: 'Toplu içe aktarma sırasında hata oluştu' });
  }
}
