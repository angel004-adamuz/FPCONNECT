// Servicio de usuarios (próxima fase)
import prisma from '../config/prisma.js';
import logger from '../config/logger.js';
import { AppError } from '../middlewares/errorHandler.js';

const fullUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  status: true,
  profileImage: true,
  bio: true,
  location: true,
  birthDate: true,
  linkedinUrl: true,
  portfolioUrl: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
  studentProfile: true,
  enterpriseProfile: true,
  centerProfile: true,
};

const pickDefined = (source, allowedFields) => {
  const result = {};

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(source, field) && source[field] !== undefined) {
      result[field] = source[field];
    }
  });

  return result;
};

export const userService = {
  // Obtener el centro al que esta vinculado el alumno autenticado
  getMyLinkedCenter: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (user.role !== 'ALUMNO') {
      throw new AppError('Solo los alumnos pueden consultar su centro vinculado', 403);
    }

    const linkedCenter = await prisma.connection.findFirst({
      where: {
        followerId: userId,
        status: 'ACTIVE',
        following: {
          role: 'CENTRO',
          status: 'ACTIVO',
        },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        following: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            bio: true,
            location: true,
            centerProfile: {
              select: {
                centerName: true,
                city: true,
                province: true,
                cicles: true,
              },
            },
          },
        },
      },
    });

    return linkedCenter?.following || null;
  },

  // Vincular alumno a un unico centro
  linkMeToCenter: async (userId, centerId) => {
    if (userId === centerId) {
      throw new AppError('No puedes vincularte a ti mismo', 400);
    }

    const [user, center] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true },
      }),
      prisma.user.findUnique({
        where: { id: centerId },
        select: {
          id: true,
          role: true,
          status: true,
          firstName: true,
          lastName: true,
          bio: true,
          location: true,
          centerProfile: {
            select: {
              centerName: true,
              city: true,
              province: true,
              cicles: true,
            },
          },
        },
      }),
    ]);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (user.role !== 'ALUMNO') {
      throw new AppError('Solo los alumnos pueden vincularse a centros', 403);
    }

    if (!center || center.role !== 'CENTRO') {
      throw new AppError('Centro educativo no encontrado', 404);
    }

    if (center.status !== 'ACTIVO') {
      throw new AppError('El centro no esta disponible', 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.connection.upsert({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: centerId,
          },
        },
        update: { status: 'ACTIVE' },
        create: {
          followerId: userId,
          followingId: centerId,
          status: 'ACTIVE',
        },
      });

      // Garantiza un unico centro vinculado por alumno
      await tx.connection.deleteMany({
        where: {
          followerId: userId,
          status: 'ACTIVE',
          followingId: { not: centerId },
          following: { role: 'CENTRO' },
        },
      });
    });

    logger.info(`🎓 Alumno ${userId} vinculado al centro ${centerId}`);

    return center;
  },

  // Desvincular alumno del centro actualmente vinculado
  unlinkMeFromCenter: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (user.role !== 'ALUMNO') {
      throw new AppError('Solo los alumnos pueden desvincular su centro', 403);
    }

    const result = await prisma.connection.deleteMany({
      where: {
        followerId: userId,
        status: 'ACTIVE',
        following: { role: 'CENTRO' },
      },
    });

    logger.info(`🎓 Alumno ${userId} desvinculado de ${result.count} centro(s)`);

    return { removedConnections: result.count };
  },

  // Obtener perfil público de usuario
  getPublicProfile: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        bio: true,
        location: true,
        role: true,
        createdAt: true,

        // Incluir perfil específico según rol
        studentProfile: {
          select: {
            cicle: true,
            specialization: true,
            courseYear: true,
            graduationYear: true,
            skills: true,
            projects: true,
            experience: true,
            cvUrl: true,
            certificatesUrl: true,
            seekingJob: true,
            jobPreferences: true,
          },
        },
        enterpriseProfile: {
          select: {
            companyName: true,
            industry: true,
            website: true,
            description: true,
          },
        },
        centerProfile: {
          select: {
            centerName: true,
            city: true,
            province: true,
            cicles: true,
          },
        },
        linkedinUrl: true,
        portfolioUrl: true,
      },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return user;
  },

  // Actualizar perfil de usuario
  updateProfile: async (userId, updateData) => {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!existingUser) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const userData = pickDefined(updateData, [
      'firstName',
      'lastName',
      'phone',
      'bio',
      'location',
      'profileImage',
      'birthDate',
      'linkedinUrl',
      'portfolioUrl',
    ]);

    if (userData.birthDate) {
      userData.birthDate = new Date(userData.birthDate);
    }

    const requestedCenterId = updateData.studentProfile?.centerId || updateData.studentProfile?.centroId;

    await prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: userData,
        });
      }

      if (existingUser.role === 'ALUMNO' && updateData.studentProfile) {
        const studentProfileData = {
          ...pickDefined(updateData.studentProfile, [
            'cicle',
            'specialization',
            'courseYear',
            'graduationYear',
            'experience',
            'skills',
            'projects',
            'cvUrl',
            'certificatesUrl',
            'seekingJob',
            'jobPreferences',
          ]),
        };

        if (Object.prototype.hasOwnProperty.call(updateData.studentProfile, 'ciclo')) {
          studentProfileData.cicle = updateData.studentProfile.ciclo;
        }
        if (Object.prototype.hasOwnProperty.call(updateData.studentProfile, 'disponibilidad')) {
          studentProfileData.seekingJob = Boolean(updateData.studentProfile.disponibilidad);
        }

        if (Object.keys(studentProfileData).length > 0) {
          await tx.studentProfile.upsert({
            where: { userId },
            update: studentProfileData,
            create: {
              userId,
              ...studentProfileData,
            },
          });
        }
      }

      if (existingUser.role === 'EMPRESA' && updateData.enterpriseProfile) {
        const enterpriseProfileData = {
          ...pickDefined(updateData.enterpriseProfile, [
            'companyName',
            'industry',
            'website',
            'employees',
            'description',
            'address',
            'city',
            'province',
            'coordinates',
          ]),
        };

        if (Object.prototype.hasOwnProperty.call(updateData.enterpriseProfile, 'sector')) {
          enterpriseProfileData.industry = updateData.enterpriseProfile.sector;
        }
        if (Object.prototype.hasOwnProperty.call(updateData.enterpriseProfile, 'size')) {
          enterpriseProfileData.employees = Number(updateData.enterpriseProfile.size) || null;
        }

        if (Object.keys(enterpriseProfileData).length > 0) {
          await tx.enterpriseProfile.upsert({
            where: { userId },
            update: enterpriseProfileData,
            create: {
              userId,
              companyName: enterpriseProfileData.companyName || '',
              ...enterpriseProfileData,
            },
          });
        }
      }

      if (existingUser.role === 'CENTRO' && updateData.centerProfile) {
        const centerProfileData = {
          ...pickDefined(updateData.centerProfile, [
            'centerName',
            'code',
            'address',
            'city',
            'province',
            'coordinates',
            'cicles',
            'director',
          ]),
        };

        if (Object.prototype.hasOwnProperty.call(updateData.centerProfile, 'provincia')) {
          centerProfileData.province = updateData.centerProfile.provincia;
        }
        if (Object.prototype.hasOwnProperty.call(updateData.centerProfile, 'ciclos')) {
          centerProfileData.cicles = updateData.centerProfile.ciclos;
        }

        if (Object.keys(centerProfileData).length > 0) {
          await tx.centerProfile.upsert({
            where: { userId },
            update: centerProfileData,
            create: {
              userId,
              centerName: centerProfileData.centerName || '',
              ...centerProfileData,
            },
          });
        }
      }
    });

    if (existingUser.role === 'ALUMNO' && requestedCenterId) {
      await userService.linkMeToCenter(userId, requestedCenterId);
    }

    const updatedUser = await userService.getUserById(userId);

    logger.info(`✏️ Perfil actualizado: ${userId}`);
    return updatedUser;
  },

  // Buscar usuarios (próxima fase)
  searchUsers: async (query, role = null, limit = 20, offset = 0) => {
    const normalizedQuery = (query || '').trim();
    let decodedQuery = normalizedQuery;
    try {
      decodedQuery = decodeURIComponent(normalizedQuery);
    } catch {
      decodedQuery = normalizedQuery;
    }
    const where = {
      status: 'ACTIVO',
    };

    // Permite listar todos cuando query sea '*' o 'all'
    if (decodedQuery && decodedQuery !== '*' && decodedQuery.toLowerCase() !== 'all') {
      where.OR = [
        { firstName: { contains: decodedQuery, mode: 'insensitive' } },
        { lastName: { contains: decodedQuery, mode: 'insensitive' } },
        { email: { contains: decodedQuery, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        bio: true,
        location: true,
        role: true,
        studentProfile: {
          select: {
            cicle: true,
            specialization: true,
            skills: true,
            seekingJob: true,
          },
        },
        enterpriseProfile: {
          select: {
            companyName: true,
            industry: true,
            city: true,
            description: true,
          },
        },
        centerProfile: {
          select: {
            centerName: true,
            city: true,
            province: true,
            cicles: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.user.count({ where });

    return { users, total };
  },

  // Obtener estadísticas de usuario (próxima fase)
  getUserStats: async (userId) => {
    const [postsCount, followersCount, followingCount, likesCount] = await Promise.all([
      prisma.post.count({ where: { authorId: userId } }),
      prisma.connection.count({ where: { followingId: userId, status: 'ACTIVE' } }),
      prisma.connection.count({ where: { followerId: userId, status: 'ACTIVE' } }),
      prisma.like.count({ where: { userId } }),
    ]);

    return {
      postsCount,
      followersCount,
      followingCount,
      likesCount,
    };
  },

  // Obtener usuario autenticado con perfiles especificos
  getUserById: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: fullUserSelect,
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (user.role !== 'ALUMNO') {
      return user;
    }

    const linkedCenter = await userService.getMyLinkedCenter(userId);
    return {
      ...user,
      linkedCenter,
    };
  },
};

export default userService;
