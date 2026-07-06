import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Project } from '../models/Project';
import { Site } from '../models/Site';
import { InventoryItem } from '../models/InventoryItem';

export async function getProjects(req: AuthRequest, res: Response): Promise<void> {
  try {
    const projects = await Project.find({ owner: req.userId }).sort({ createdAt: -1 });

    const enriched = await Promise.all(
      projects.map(async (p) => {
        const sites = await Site.find({ project: p._id });
        const siteIds = sites.map((s) => s._id);
        const itemCount = await InventoryItem.countDocuments({ site: { $in: siteIds } });
        return { ...p.toJSON(), siteCount: sites.length, itemCount };
      })
    );

    res.json(enriched);
  } catch {
    res.status(500).json({ message: 'Projeler yüklenirken hata oluştu' });
  }
}

export async function createProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const project = await Project.create({ ...req.body, owner: req.userId });
    res.status(201).json({ ...project.toJSON(), siteCount: 0, itemCount: 0 });
  } catch {
    res.status(500).json({ message: 'Proje oluşturulurken hata oluştu' });
  }
}

export async function updateProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      req.body,
      { new: true }
    );
    if (!project) {
      res.status(404).json({ message: 'Proje bulunamadı' });
      return;
    }
    res.json(project);
  } catch {
    res.status(500).json({ message: 'Proje güncellenirken hata oluştu' });
  }
}

export async function deleteProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!project) {
      res.status(404).json({ message: 'Proje bulunamadı' });
      return;
    }

    const sites = await Site.find({ project: project._id });
    const siteIds = sites.map((s) => s._id);
    await InventoryItem.deleteMany({ site: { $in: siteIds } });
    await Site.deleteMany({ project: project._id });

    res.json({ message: 'Proje ve ilişkili veriler silindi' });
  } catch {
    res.status(500).json({ message: 'Proje silinirken hata oluştu' });
  }
}
