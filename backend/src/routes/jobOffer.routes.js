import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const offers = await prisma.jobOffer.findMany({
      where: { status: 'ABIERTA' },
      include: {
        enterprise: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: offers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, type, ciclesRequired, location, salary } = req.body;
    const enterprise = await prisma.enterpriseProfile.findUnique({ where: { userId: req.user.id } });
    if (!enterprise) return res.status(403).json({ success: false, message: 'Solo las empresas pueden crear ofertas' });
    const offer = await prisma.jobOffer.create({
      data: {
        title, description,
        type: type || 'EMPLEO',
        ciclesRequired: ciclesRequired ? JSON.stringify(ciclesRequired) : null,
        location, salary,
        enterpriseId: enterprise.id,
      },
      include: { enterprise: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } }
    });
    res.status(201).json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const enterprise = await prisma.enterpriseProfile.findUnique({ where: { userId: req.user.id } });
    await prisma.jobOffer.delete({ where: { id: req.params.id, enterpriseId: enterprise?.id } });
    res.json({ success: true, message: 'Oferta eliminada' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;