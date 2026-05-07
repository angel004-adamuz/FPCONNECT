import { Router } from 'express';
import prisma from '../config/prisma.js';
import { authMiddleware } from '../middlewares/auth.js';
import notificationService from '../services/notification.service.js';

const router = Router();

const APPLICATION_STATUS_TO_DB = {
  PENDING: 'PENDIENTE',
  REVIEWED: 'REVISADA',
  ACCEPTED: 'ACEPTADA',
  REJECTED: 'RECHAZADA',
};

const APPLICATION_STATUS_FROM_DB = {
  PENDIENTE: 'PENDING',
  REVISADA: 'REVIEWED',
  ENTREVISTA: 'REVIEWED',
  ACEPTADA: 'ACCEPTED',
  RECHAZADA: 'REJECTED',
};

const serializeApplication = (application) => ({
  ...application,
  status: APPLICATION_STATUS_FROM_DB[application.status] || application.status,
});

const serializeOffer = (offer) => ({
  ...offer,
  applications: offer.applications?.map(serializeApplication),
});

const attachStudentsToApplications = async (applications) => {
  const studentIds = [...new Set(applications.map((application) => application.studentId))];
  const students = await prisma.studentProfile.findMany({
    where: { id: { in: studentIds } },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          bio: true,
          location: true,
          linkedinUrl: true,
          portfolioUrl: true,
        },
      },
    },
  });
  const studentsById = new Map(students.map((student) => [student.id, student]));

  return applications.map((application) => ({
    ...application,
    student: studentsById.get(application.studentId) || null,
  }));
};

const findStudentProfile = async (userId) => {
  return prisma.studentProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          bio: true,
          location: true,
        },
      },
    },
  });
};

const findOwnedEnterpriseOffer = async (offerId, userId) => {
  return prisma.jobOffer.findFirst({
    where: {
      id: offerId,
      enterprise: { userId },
    },
    include: {
      enterprise: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
  });
};

router.get('/', authMiddleware, async (req, res) => {
  try {
    const studentProfile = req.user.role === 'ALUMNO'
      ? await prisma.studentProfile.findUnique({ where: { userId: req.user.id } })
      : null;

    const offers = await prisma.jobOffer.findMany({
      where: { status: 'ABIERTA' },
      include: {
        enterprise: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        applications: studentProfile
          ? {
              where: { studentId: studentProfile.id },
              select: {
                id: true,
                status: true,
                appliedAt: true,
                updatedAt: true,
              },
            }
          : false,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: offers.map(serializeOffer) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, type, ciclesRequired, location, salary } = req.body;
    const enterprise = await prisma.enterpriseProfile.findUnique({ where: { userId: req.user.id } });

    if (!enterprise) {
      return res.status(403).json({ success: false, message: 'Solo las empresas pueden crear ofertas' });
    }

    const offer = await prisma.jobOffer.create({
      data: {
        title,
        description,
        type: type || 'EMPLEO',
        ciclesRequired: ciclesRequired ? JSON.stringify(ciclesRequired) : null,
        location,
        salary,
        enterpriseId: enterprise.id,
      },
      include: {
        enterprise: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    res.status(201).json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/my-applications', authMiddleware, async (req, res) => {
  try {
    const studentProfile = await findStudentProfile(req.user.id);

    if (!studentProfile) {
      return res.status(403).json({ success: false, message: 'Solo los alumnos pueden consultar sus aplicaciones' });
    }

    const applications = await prisma.jobApplication.findMany({
      where: { studentId: studentProfile.id },
      include: {
        jobOffer: {
          include: {
            enterprise: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.json({ success: true, data: applications.map(serializeApplication) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/apply', authMiddleware, async (req, res) => {
  try {
    const studentProfile = await findStudentProfile(req.user.id);

    if (!studentProfile) {
      return res.status(403).json({ success: false, message: 'Solo los alumnos pueden aplicar a ofertas' });
    }

    const offer = await prisma.jobOffer.findUnique({ where: { id: req.params.id } });

    if (!offer || offer.status !== 'ABIERTA') {
      return res.status(404).json({ success: false, message: 'Oferta no encontrada o cerrada' });
    }

    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        jobOfferId_studentId: {
          jobOfferId: offer.id,
          studentId: studentProfile.id,
        },
      },
    });

    if (existingApplication) {
      return res.status(409).json({ success: false, message: 'Ya has aplicado a esta oferta' });
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobOfferId: offer.id,
        studentId: studentProfile.id,
        coverLetter: req.body.coverLetter || null,
        status: 'PENDIENTE',
      },
      include: {
        jobOffer: {
          include: {
            enterprise: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
              },
            },
          },
        },
      },
    });

    res.status(201).json({ success: true, data: serializeApplication(application) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id/applications', authMiddleware, async (req, res) => {
  try {
    const offer = await findOwnedEnterpriseOffer(req.params.id, req.user.id);

    if (!offer) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para ver estas aplicaciones' });
    }

    const applications = await prisma.jobApplication.findMany({
      where: { jobOfferId: offer.id },
      include: {
        jobOffer: true,
      },
      orderBy: { appliedAt: 'desc' },
    });

    const applicationsWithStudents = await attachStudentsToApplications(applications);
    res.json({ success: true, data: applicationsWithStudents.map(serializeApplication) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/applications/:applicationId', authMiddleware, async (req, res) => {
  try {
    const dbStatus = APPLICATION_STATUS_TO_DB[req.body.status];

    if (!dbStatus) {
      return res.status(400).json({
        success: false,
        message: 'Estado no valido. Usa PENDING, REVIEWED, ACCEPTED o REJECTED',
      });
    }

    const offer = await findOwnedEnterpriseOffer(req.params.id, req.user.id);

    if (!offer) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para modificar esta aplicacion' });
    }

    const application = await prisma.jobApplication.findFirst({
      where: {
        id: req.params.applicationId,
        jobOfferId: offer.id,
      },
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Aplicacion no encontrada' });
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: application.id },
      data: { status: dbStatus },
      include: {
        jobOffer: true,
      },
    });

    const [applicationWithStudent] = await attachStudentsToApplications([updatedApplication]);
    const studentUserId = applicationWithStudent.student?.user?.id;

    if (studentUserId) {
      await notificationService.createNotificationIfRecipientIsDifferent({
        userId: studentUserId,
        type: 'application_status',
        title: 'Solicitud actualizada',
        message: `Tu solicitud para ${updatedApplication.jobOffer.title} fue actualizada`,
        actorId: req.user.id,
        targetId: updatedApplication.jobOfferId,
        relatedData: {
          offerId: updatedApplication.jobOfferId,
          applicationId: updatedApplication.id,
          status: serializeApplication(updatedApplication).status,
        },
      }, req.user.id, req.app.get('io'));
    }

    res.json({ success: true, data: serializeApplication(applicationWithStudent) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const offer = await findOwnedEnterpriseOffer(req.params.id, req.user.id);

    if (!offer) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar esta oferta' });
    }

    await prisma.jobOffer.delete({ where: { id: offer.id } });
    res.json({ success: true, message: 'Oferta eliminada' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
