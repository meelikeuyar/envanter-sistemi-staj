import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Site } from '../models/Site';
import { Project } from '../models/Project';
import { InventoryItem } from '../models/InventoryItem';

export async function getSites(req: AuthRequest, res: Response): Promise<void> {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, owner: req.userId });
    if (!project) {
      res.status(404).json({ message: 'Proje bulunamadı' });
      return;
    }

    const sites = await Site.find({ project: project._id }).sort({ name: 1 });

    const enriched = await Promise.all(
      sites.map(async (s) => {
        const itemCount = await InventoryItem.countDocuments({ site: s._id });
        return { ...s.toJSON(), itemCount };
      })
    );

    res.json(enriched);
  } catch {
    res.status(500).json({ message: 'Siteler yüklenirken hata oluştu' });
  }
}

export async function createSite(req: AuthRequest, res: Response): Promise<void> {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, owner: req.userId });
    if (!project) {
      res.status(404).json({ message: 'Proje bulunamadı' });
      return;
    }

    const site = await Site.create({ ...req.body, project: project._id });
    res.status(201).json({ ...site.toJSON(), itemCount: 0 });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ message: 'Bu site kodu zaten mevcut' });
      return;
    }
    res.status(500).json({ message: 'Site oluşturulurken hata oluştu' });
  }
}

export async function updateSite(req: AuthRequest, res: Response): Promise<void> {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, owner: req.userId });
    if (!project) {
      res.status(404).json({ message: 'Proje bulunamadı' });
      return;
    }

    const site = await Site.findOneAndUpdate(
      { _id: req.params.id, project: project._id },
      req.body,
      { new: true }
    );
    if (!site) {
      res.status(404).json({ message: 'Site bulunamadı' });
      return;
    }
    res.json(site);
  } catch {
    res.status(500).json({ message: 'Site güncellenirken hata oluştu' });
  }
}

export async function deleteSite(req: AuthRequest, res: Response): Promise<void> {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, owner: req.userId });
    if (!project) {
      res.status(404).json({ message: 'Proje bulunamadı' });
      return;
    }

    const site = await Site.findOneAndDelete({ _id: req.params.id, project: project._id });
    if (!site) {
      res.status(404).json({ message: 'Site bulunamadı' });
      return;
    }

    await InventoryItem.deleteMany({ site: site._id });
    res.json({ message: 'Site ve envanter kayıtları silindi' });
  } catch {
    res.status(500).json({ message: 'Site silinirken hata oluştu' });
  }
}
