// Seed de datos de ejemplo para demo
import bcrypt from 'bcrypt';
import prisma from '../src/config/prisma.js';
import logger from '../src/config/logger.js';

const DEMO_PASSWORD = 'Password123';

const centers = [
  {
    email: 'iescartuja.fp@demo.com',
    firstName: 'IES Cartuja',
    lastName: 'FP',
    centerName: 'IES Cartuja',
    city: 'Granada',
    province: 'Granada',
    cicles: ['GS: DAM', 'GS: DAW', 'GS: ASIR', 'GE: IA y Big Data'],
    posts: [
      'Abrimos plazas para FCT en DAM y DAW con empresas tecnológicas de Granada. Solicitudes hasta el 30 de abril.',
      'Jornada de puertas abiertas este viernes a las 17:00 para familias interesadas en ciclos de informática.',
    ],
  },
  {
    email: 'politecnico.malaga@demo.com',
    firstName: 'Politécnico',
    lastName: 'Málaga',
    centerName: 'IES Politécnico Jesús Marín',
    city: 'Málaga',
    province: 'Málaga',
    cicles: ['GM: SMR', 'GS: DAM', 'GS: ASIR', 'GE: Ciberseguridad en entornos IT'],
    posts: [
      'Nuevo convenio con empresas de ciberseguridad para alumnado de ASIR. Inicio de prácticas en mayo.',
      'Publicado el calendario de pruebas de acceso a ciclos de grado superior para el curso 2026/2027.',
    ],
  },
  {
    email: 'triana.sevilla@demo.com',
    firstName: 'IES Triana',
    lastName: 'FP',
    centerName: 'IES Triana',
    city: 'Sevilla',
    province: 'Sevilla',
    cicles: ['GS: DAW', 'GS: DAM'],
    posts: [
      'Buscamos proyectos colaborativos con startups sevillanas para alumnado de segundo de DAW.',
    ],
  },
  {
    email: 'lafuensanta.cordoba@demo.com',
    firstName: 'IES La Fuensanta',
    lastName: 'FP',
    centerName: 'IES La Fuensanta',
    city: 'Córdoba',
    province: 'Córdoba',
    cicles: ['GM: SMR', 'GS: DAW'],
    posts: [
      'Taller intensivo de empleabilidad tecnológica: preparación de CV, LinkedIn y entrevistas técnicas.',
    ],
  },
  {
    email: 'zaframar.huelva@demo.com',
    firstName: 'IES Zaframar',
    lastName: 'FP',
    centerName: 'IES Zaframar',
    city: 'Huelva',
    province: 'Huelva',
    cicles: ['GS: DAM', 'GM: SMR'],
    posts: [
      'Publicadas las becas de movilidad para realizar prácticas duales en empresas colaboradoras de Huelva.',
    ],
  },
];

const enterprises = [
  {
    email: 'rh@techsolutions.demo.com',
    firstName: 'Tech Solutions',
    lastName: 'Granada',
    companyName: 'Tech Solutions Granada',
    industry: 'Desarrollo de Software',
    website: 'https://techsolutions.example.com',
    employees: 45,
    city: 'Granada',
    province: 'Granada',
    description: 'Empresa especializada en desarrollo web y aplicaciones móviles. Trabajo con tecnologías modernas como React, Node.js, Flutter.',
    posts: [
      '🔥 Oferta FCT: Buscamos 3 alumnos de DAM para incorporarse a nuestro equipo de backend. ¡Únete a nuestro equipo!',
      'Somos un distribuidor oficial de tecnología y ofrecemos prácticas en desarrollo frontend y soporte técnico.',
    ],
  },
  {
    email: 'recursos@infomalaga.demo.com',
    firstName: 'InfoMálaga',
    lastName: 'Consulting',
    companyName: 'InfoMálaga Consulting',
    industry: 'Consultoría IT',
    website: 'https://infomalaga.example.com',
    employees: 120,
    city: 'Málaga',
    province: 'Málaga',
    description: 'Consultoría informática con más de 15 años de experiencia. Brindamos soluciones de transformación digital y ciberseguridad.',
    posts: [
      '📢 ¡Únete a nuestro programa de prácticas ASIR! Ofrecemos formación en hardening de servidores y auditoría de seguridad.',
      'Convocatoria abierta para FCT de alumnos de Sistemas y Redes. Modalidad presencial en nuestro hub de Málaga.',
    ],
  },
  {
    email: 'contact@webstudio.demo.com',
    firstName: 'WebStudio',
    lastName: 'Sevilla',
    companyName: 'WebStudio Sevilla',
    industry: 'Agencia Digital',
    website: 'https://webstudio.example.com',
    employees: 28,
    city: 'Sevilla',
    province: 'Sevilla',
    description: 'Agencia creativa especializada en diseño web, UX/UI y desarrollo frontend. Trabajamos con startups y empresas consolidadas.',
    posts: [
      '🎨 Oferta DAW: Buscamos diseñador frontend junior para proyecto de plataforma e-commerce. React expertise requerida.',
      'Plazas disponibles para FCT de alumnos de DAW. Aprenderás Vue.js, Figma y metodologías ágiles en equipo.',
    ],
  },
  {
    email: 'hr@datasys.demo.com',
    firstName: 'DataSys',
    lastName: 'Córdoba',
    companyName: 'DataSys Analytics',
    industry: 'Big Data & Analytics',
    website: 'https://datasys.example.com',
    employees: 65,
    city: 'Córdoba',
    province: 'Córdoba',
    description: 'Plataforma de análisis de datos y business intelligence. Trabajamos con Python, SQL avanzado y herramientas de visualización.',
    posts: [
      '📊 Practicante de DAM para equipo de análisis de datos. Conocimientos de Python y SQL serán valorados.',
      '¡Nueva bolsa de FCT! Ofrecemos formación práctica en pipelines de datos, ETL y reportes interactivos.',
    ],
  },
  {
    email: 'equiporh@cloudtec.demo.com',
    firstName: 'CloudTec',
    lastName: 'Huelva',
    companyName: 'CloudTec Infraestructuras',
    industry: 'Cloud & Hosting',
    website: 'https://cloudtec.example.com',
    employees: 92,
    city: 'Huelva',
    province: 'Huelva',
    description: 'Proveedor de soluciones cloud, hosting y infraestructura como servicio. Especialistas en AWS, Docker y Kubernetes.',
    posts: [
      '☁️ Oferta SMR/ASIR: Administrador junior de sistemas para equipo de infraestructura. Linux, Docker y nociones de Kubernetes.',
      'FCT disponible: Aprenderás gestión de servidores en cloud, monitorización con Prometheus y automatización con Ansible.',
    ],
  },
  {
    email: 'hello@softmart.demo.com',
    firstName: 'SoftMart',
    lastName: 'Solutions',
    companyName: 'SoftMart Solutions',
    industry: 'Marketing Digital',
    website: 'https://softmart.example.com',
    employees: 32,
    city: 'Sevilla',
    province: 'Sevilla',
    description: 'Agencia de marketing digital especializada en estrategia SEO, redes sociales y desarrollo de plataformas e-commerce personalizadas.',
    posts: [
      '🎯 Buscamos practicante DAW para equipo de desarrollo web. Experiencia con JavaScript y WordPress valorada.',
      'Abierta convocatoria FCT: Aprenderás full marketing digital + desarrollo web en proyecto real.',
    ],
  },
  {
    email: 'contacto@devforce.demo.com',
    firstName: 'DevForce',
    lastName: 'Studio',
    companyName: 'DevForce Studio',
    industry: 'Desarrollo Multiplataforma',
    website: 'https://devforce.example.com',
    employees: 58,
    city: 'Granada',
    province: 'Granada',
    description: 'Studio especializado en desarrollo de apps móviles (iOS/Android), web progressivas y soluciones Flutter/React Native.',
    posts: [
      '📱 ¡Únete a nuestro equipo de dev mobile! Buscamos alumno DAM con interés en Flutter y Dart.',
      'Practicante de desarrollo multiplataforma: trabajarás con React Native, buena oportunidad para aprender.',
    ],
  },
  {
    email: 'rh@securenet.demo.com',
    firstName: 'SecureNet',
    lastName: 'Security',
    companyName: 'SecureNet Security Solutions',
    industry: 'Ciberseguridad Avanzada',
    website: 'https://securenet.example.com',
    employees: 75,
    city: 'Málaga',
    province: 'Málaga',
    description: 'Centro de excelencia en ciberseguridad: pentesting, análisis de vulnerabilidades, formación y certificaciones de seguridad.',
    posts: [
      '🔒 Practicante ASIR especializado en pentesting. Certificaciones de seguridad son un plus.',
      'Abierto programa de FCT en ciberseguridad ofensiva y defensiva. Oportunidad única de aprender en real.',
    ],
  },
  {
    email: 'jobs@greentech.demo.com',
    firstName: 'GreenTech',
    lastName: 'Innovators',
    companyName: 'GreenTech Innovators',
    industry: 'Sostenibilidad & SaaS',
    website: 'https://greentech.example.com',
    employees: 42,
    city: 'Córdoba',
    province: 'Córdoba',
    description: 'Startup y scaleup en SaaS para sostenibilidad ambiental. Stack: Python, FastAPI, PostgreSQL, React, AWS.',
    posts: [
      '🌍 Buscamos practicante DAM Backend! Python + FastAPI. Trabajarás en producto real con impacto ambiental.',
      'Becario/a fullstack: crecer en startup sostenible, tutoría 1-on-1, flexibilidad horaria.',
    ],
  },
  {
    email: 'careers@mobilefirst.demo.com',
    firstName: 'MobileFirst',
    lastName: 'Apps',
    companyName: 'MobileFirst Apps Studio',
    industry: 'Desarrollo de Apps Móviles',
    website: 'https://mobilefirst.example.com',
    employees: 38,
    city: 'Huelva',
    province: 'Huelva',
    description: 'Estudio creativo especializado en diseño y desarrollo de aplicaciones mobiles nativas e híbridas de alto rendimiento.',
    posts: [
      '📲 Practicante DAM/DAW: Kotlin/Swift o React Native. Participa en apps que usan millones de usuarios.',
      '¡FCT disponible! Desarrollarás apps reales, aprenderás agile, design thinking y deployment.',
    ],
  },
];

const demoStudents = [
  {
    email: 'alumno@test.com',
    firstName: 'Juan',
    lastName: 'Garcia',
    location: 'Granada, Andalucia',
    bio: 'Estudiante DAM con foco en backend Node.js y APIs REST. Busco FCT en desarrollo de producto.',
    cicle: 'DAM',
    specialization: 'Desarrollo de Aplicaciones Multiplataforma',
    courseYear: 2,
    graduationYear: 2026,
    experience: 'Proyecto final: app de gestion academica con React, Node.js, Prisma y PostgreSQL. Participacion en hackathon universitario.',
    skills: ['JavaScript', 'Node.js', 'Express', 'Prisma', 'PostgreSQL', 'React', 'Git'],
    projects: [
      'FPConnect Clone: red profesional para estudiantes de FP',
      'TaskFlow: gestor de tareas en tiempo real con Socket.io',
    ],
    cvUrl: 'https://example.com/cv/juan-garcia-dam.pdf',
    certificatesUrl: [
      'https://example.com/certs/juan-javascript.pdf',
      'https://example.com/certs/juan-postgresql.pdf',
    ],
    seekingJob: true,
    jobPreferences: {
      modalidad: 'Hibrido',
      jornada: 'Completa',
      tecnologias: ['Node.js', 'React', 'SQL'],
      ciudades: ['Granada', 'Malaga', 'Sevilla'],
    },
    linkedinUrl: 'https://www.linkedin.com/in/juan-garcia-fp',
    portfolioUrl: 'https://portfolio.juan-garcia.dev',
    centerEmail: 'iescartuja.fp@demo.com',
  },
  {
    email: 'marta.romero@demo.com',
    firstName: 'Marta',
    lastName: 'Romero',
    location: 'Malaga, Andalucia',
    bio: 'Perfil DAW orientado a frontend y UX. Me gusta convertir requisitos en interfaces limpias y accesibles.',
    cicle: 'DAW',
    specialization: 'Desarrollo de Aplicaciones Web',
    courseYear: 2,
    graduationYear: 2026,
    experience: 'Practicas internas en departamento TIC del centro. Colaboracion en web para asociacion local.',
    skills: ['React', 'Vite', 'CSS', 'TypeScript', 'Figma', 'Testing Library'],
    projects: [
      'Portal FP Jobs con filtros avanzados y dashboard',
      'UI Kit accesible para componentes educativos',
    ],
    cvUrl: 'https://example.com/cv/marta-romero-daw.pdf',
    certificatesUrl: [
      'https://example.com/certs/marta-frontend.pdf',
    ],
    seekingJob: true,
    jobPreferences: {
      modalidad: 'Remoto',
      jornada: 'Completa',
      tecnologias: ['React', 'TypeScript', 'Design Systems'],
      ciudades: ['Malaga', 'Remote'],
    },
    linkedinUrl: 'https://www.linkedin.com/in/marta-romero-fp',
    portfolioUrl: 'https://marta-ui.dev',
    centerEmail: 'politecnico.malaga@demo.com',
  },
  {
    email: 'pablo.sanchez@demo.com',
    firstName: 'Pablo',
    lastName: 'Sanchez',
    location: 'Sevilla, Andalucia',
    bio: 'Alumno ASIR y especialista en redes/sistemas. Interesado en roles de ciberseguridad junior.',
    cicle: 'ASIR',
    specialization: 'Administracion de Sistemas Informaticos en Red',
    courseYear: 2,
    graduationYear: 2026,
    experience: 'Laboratorio virtual con hardening Linux, segmentacion de red y monitorizacion con Grafana.',
    skills: ['Linux', 'Docker', 'Bash', 'Networking', 'Cybersecurity', 'Nginx'],
    projects: [
      'SOC educativo con ELK + alertas basicas',
      'Automatizacion de despliegues con scripts bash',
    ],
    cvUrl: 'https://example.com/cv/pablo-sanchez-asir.pdf',
    certificatesUrl: [
      'https://example.com/certs/pablo-linux.pdf',
      'https://example.com/certs/pablo-cybersecurity.pdf',
    ],
    seekingJob: true,
    jobPreferences: {
      modalidad: 'Presencial',
      jornada: 'Completa',
      tecnologias: ['Linux', 'Redes', 'Ciberseguridad'],
      ciudades: ['Sevilla', 'Cadiz'],
    },
    linkedinUrl: 'https://www.linkedin.com/in/pablo-sanchez-fp',
    portfolioUrl: 'https://pablo-systems.dev',
    centerEmail: 'triana.sevilla@demo.com',
  },
  {
    email: 'laura.nieto@demo.com',
    firstName: 'Laura',
    lastName: 'Nieto',
    location: 'Cordoba, Andalucia',
    bio: 'Estudiante SMR con mucho interes por soporte IT, microservicios y mantenimiento de infraestructuras.',
    cicle: 'SMR',
    specialization: 'Sistemas Microinformaticos y Redes',
    courseYear: 2,
    graduationYear: 2026,
    experience: 'Soporte tecnico en aula TIC y mantenimiento de parque informatico del centro.',
    skills: ['Hardware', 'Windows Server', 'Virtualizacion', 'Helpdesk', 'Office 365'],
    projects: [
      'Inventario IT con etiquetas QR y panel web',
      'Plan de mantenimiento preventivo para centro educativo',
    ],
    cvUrl: 'https://example.com/cv/laura-nieto-smr.pdf',
    certificatesUrl: [
      'https://example.com/certs/laura-helpdesk.pdf',
    ],
    seekingJob: false,
    jobPreferences: {
      modalidad: 'Presencial',
      jornada: 'Parcial',
      tecnologias: ['Helpdesk', 'Sistemas', 'Virtualizacion'],
      ciudades: ['Cordoba'],
    },
    linkedinUrl: 'https://www.linkedin.com/in/laura-nieto-fp',
    portfolioUrl: 'https://laura-tech-lab.dev',
    centerEmail: 'lafuensanta.cordoba@demo.com',
  },
  {
    email: 'sergio.morales@demo.com',
    firstName: 'Sergio',
    lastName: 'Morales',
    location: 'Huelva, Andalucia',
    bio: 'Alumno DAM con perfil fullstack. Muy comodo construyendo APIs y paneles de administracion.',
    cicle: 'DAM',
    specialization: 'Desarrollo de Aplicaciones Multiplataforma',
    courseYear: 1,
    graduationYear: 2027,
    experience: 'Desarrollo de mini ERP academico para gestion de practicas y seguimiento de alumnado.',
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'React', 'REST APIs'],
    projects: [
      'Mini ERP FCT para tutorias y empresas',
      'API de notificaciones push para eventos academicos',
    ],
    cvUrl: 'https://example.com/cv/sergio-morales-dam.pdf',
    certificatesUrl: [
      'https://example.com/certs/sergio-java.pdf',
    ],
    seekingJob: true,
    jobPreferences: {
      modalidad: 'Hibrido',
      jornada: 'Completa',
      tecnologias: ['Java', 'Spring', 'React'],
      ciudades: ['Huelva', 'Sevilla'],
    },
    linkedinUrl: 'https://www.linkedin.com/in/sergio-morales-fp',
    portfolioUrl: 'https://sergiodevfolio.dev',
    centerEmail: 'zaframar.huelva@demo.com',
  },
  {
    email: 'maria.lopez@demo.com',
    firstName: 'María',
    lastName: 'López',
    location: 'Granada, Andalucia',
    bio: 'Estudiante DAW especializada en frontend y diseño responsivo. Apasionada por UX/UI y animaciones CSS.',
    cicle: 'DAW',
    specialization: 'Desarrollo de Aplicaciones Web',
    courseYear: 1,
    graduationYear: 2027,
    experience: 'Desarrollo de página web para tienda local. Manejo de CMS WordPress y diseño en Figma.',
    skills: ['HTML', 'CSS', 'JavaScript', 'Figma', 'WordPress', 'Vue.js'],
    projects: [
      'Landing page responsive con animaciones CSS avanzadas',
      'Dashboard interactivo de visualización de datos',
    ],
    cvUrl: 'https://example.com/cv/maria-lopez-daw.pdf',
    certificatesUrl: ['https://example.com/certs/maria-frontend.pdf'],
    seekingJob: true,
    jobPreferences: {
      modalidad: 'Hibrido',
      jornada: 'Completa',
      tecnologias: ['Vue.js', 'CSS', 'Design Systems'],
      ciudades: ['Granada', 'Sevilla'],
    },
    linkedinUrl: 'https://www.linkedin.com/in/maria-lopez-fp',
    portfolioUrl: 'https://maria-portfolio.dev',
    centerEmail: 'iescartuja.fp@demo.com',
  },
  {
    email: 'carlos.rodriguez@demo.com',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    location: 'Malaga, Andalucia',
    bio: 'Apasionado por backend escalable. Experiencia con Python y bases de datos relacionales.',
    cicle: 'DAM',
    specialization: 'Desarrollo de Aplicaciones Multiplataforma',
    courseYear: 2,
    graduationYear: 2026,
    experience: 'API REST con FastAPI. Participación en proyecto de análisis de datos con pandas.',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'MongoDB', 'Docker', 'Postman'],
    projects: [
      'API de gestión de inventario con filtros avanzados',
      'Pipeline de datos con Python y SQL',
    ],
    cvUrl: 'https://example.com/cv/carlos-rodriguez-dam.pdf',
    certificatesUrl: ['https://example.com/certs/carlos-python.pdf'],
    seekingJob: true,
    jobPreferences: {
      modalidad: 'Remoto',
      jornada: 'Completa',
      tecnologias: ['Python', 'FastAPI', 'PostgreSQL'],
      ciudades: ['Malaga', 'Remote'],
    },
    linkedinUrl: 'https://www.linkedin.com/in/carlos-rodriguez-fp',
    portfolioUrl: 'https://carlos-backend.dev',
    centerEmail: 'politecnico.malaga@demo.com',
  },
  {
    email: 'ana.garcia@demo.com',
    firstName: 'Ana',
    lastName: 'García',
    location: 'Sevilla, Andalucia',
    bio: 'Estudiante ASIR con certificaciones en Linux y redes. Interesada en administración de sistemas.',
    cicle: 'ASIR',
    specialization: 'Administracion de Sistemas Informaticos en Red',
    courseYear: 1,
    graduationYear: 2027,
    experience: 'Laboratorio de virtualización con VirtualBox. Configuración de servidores Ubuntu y CentOS.',
    skills: ['Linux', 'Networking', 'Firewall', 'SSH', 'Apache', 'Nginx'],
    projects: [
      'Laboratorio de redes segmentadas',
      'Automatización de backups en servidor Linux',
    ],
    cvUrl: 'https://example.com/cv/ana-garcia-asir.pdf',
    certificatesUrl: ['https://example.com/certs/ana-linux.pdf'],
    seekingJob: true,
    jobPreferences: {
      modalidad: 'Presencial',
      jornada: 'Completa',
      tecnologias: ['Linux', 'Networking', 'Servidores'],
      ciudades: ['Sevilla', 'Malaga'],
    },
    linkedinUrl: 'https://www.linkedin.com/in/ana-garcia-fp',
    portfolioUrl: 'https://ana-sysadmin.dev',
    centerEmail: 'triana.sevilla@demo.com',
  },
  {
    email: 'roberto.diaz@demo.com',
    firstName: 'Roberto',
    lastName: 'Díaz',
    location: 'Cordoba, Andalucia',
    bio: 'Alumno SMR enfocado en soporte técnico y mantenimiento preventivo de infraestructuras.',
    cicle: 'SMR',
    specialization: 'Sistemas Microinformaticos y Redes',
    courseYear: 1,
    graduationYear: 2027,
    experience: 'Prácticas internas en departamento IT. Soporte técnico a usuarios de la institución.',
    skills: ['Windows', 'Linux básico', 'Active Directory', 'Office 365', 'Ticketing'],
    projects: [
      'Documentación de procesos de soporte técnico',
      'Manual de resolución de incidencias frecuentes',
    ],
    cvUrl: 'https://example.com/cv/roberto-diaz-smr.pdf',
    certificatesUrl: ['https://example.com/certs/roberto-support.pdf'],
    seekingJob: true,
    jobPreferences: {
      modalidad: 'Presencial',
      jornada: 'Completa',
      tecnologias: ['Windows', 'Soporte Técnico', 'Redes'],
      ciudades: ['Cordoba'],
    },
    linkedinUrl: 'https://www.linkedin.com/in/roberto-diaz-fp',
    portfolioUrl: 'https://roberto-itsupport.dev',
    centerEmail: 'lafuensanta.cordoba@demo.com',
  },
  {
    email: 'elena.fernandez@demo.com',
    firstName: 'Elena',
    lastName: 'Fernández',
    location: 'Huelva, Andalucia',
    bio: 'Desarrolladora fullstack con interés en aplicaciones móviles y multiplataforma.',
    cicle: 'DAM',
    specialization: 'Desarrollo de Aplicaciones Multiplataforma',
    courseYear: 2,
    graduationYear: 2026,
    experience: 'App Android con Kotlin. Experiencia en desarrollo de interfaces responsivas.',
    skills: ['Kotlin', 'Android', 'JavaScript', 'React', 'SQLite', 'Material Design'],
    projects: [
      'App de gestor de tareas con sincronización',
      'Cliente Android integrado con API REST',
    ],
    cvUrl: 'https://example.com/cv/elena-fernandez-dam.pdf',
    certificatesUrl: ['https://example.com/certs/elena-kotlin.pdf'],
    seekingJob: true,
    jobPreferences: {
      modalidad: 'Hibrido',
      jornada: 'Completa',
      tecnologias: ['Kotlin', 'Android', 'React'],
      ciudades: ['Huelva', 'Sevilla'],
    },
    linkedinUrl: 'https://www.linkedin.com/in/elena-fernandez-fp',
    portfolioUrl: 'https://elena-mobile.dev',
    centerEmail: 'zaframar.huelva@demo.com',
  },
];

const ensurePost = async (authorId, content) => {
  const existingPost = await prisma.post.findFirst({
    where: { authorId, content },
    select: { id: true },
  });

  if (!existingPost) {
    await prisma.post.create({
      data: {
        authorId,
        content,
        visibility: 'PUBLIC',
      },
    });
  }
};

const seedDatabase = async () => {
  try {
    logger.info('🌱 Iniciando seed de BD...');
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

    const centerIdsByEmail = {};
    const createdCenterIds = [];

    // Centros FP de ejemplo de Andalucia
    for (const center of centers) {
      const centerUser = await prisma.user.upsert({
        where: { email: center.email },
        update: {
          firstName: center.firstName,
          lastName: center.lastName,
          role: 'CENTRO',
          status: 'ACTIVO',
          location: `${center.city}, ${center.province}`,
          bio: `${center.centerName} - Centro de FP en ${center.city}`,
        },
        create: {
          email: center.email,
          password: hashedPassword,
          firstName: center.firstName,
          lastName: center.lastName,
          role: 'CENTRO',
          status: 'ACTIVO',
          location: `${center.city}, ${center.province}`,
          bio: `${center.centerName} - Centro de FP en ${center.city}`,
        },
      });

      await prisma.centerProfile.upsert({
        where: { userId: centerUser.id },
        update: {
          centerName: center.centerName,
          city: center.city,
          province: center.province,
          cicles: JSON.stringify(center.cicles),
        },
        create: {
          userId: centerUser.id,
          centerName: center.centerName,
          city: center.city,
          province: center.province,
          cicles: JSON.stringify(center.cicles),
        },
      });

      for (const content of center.posts) {
        await ensurePost(centerUser.id, content);
      }

      centerIdsByEmail[center.email] = centerUser.id;
      createdCenterIds.push(centerUser.id);
    }

    const createdStudentIds = [];

    // Estudiantes demo con perfil completo y CV de ejemplo
    for (const student of demoStudents) {
      const studentUser = await prisma.user.upsert({
        where: { email: student.email },
        update: {
          firstName: student.firstName,
          lastName: student.lastName,
          role: 'ALUMNO',
          status: 'ACTIVO',
          location: student.location,
          bio: student.bio,
          linkedinUrl: student.linkedinUrl,
          portfolioUrl: student.portfolioUrl,
        },
        create: {
          email: student.email,
          password: hashedPassword,
          firstName: student.firstName,
          lastName: student.lastName,
          role: 'ALUMNO',
          status: 'ACTIVO',
          location: student.location,
          bio: student.bio,
          linkedinUrl: student.linkedinUrl,
          portfolioUrl: student.portfolioUrl,
        },
      });

      await prisma.studentProfile.upsert({
        where: { userId: studentUser.id },
        update: {
          cicle: student.cicle,
          specialization: student.specialization,
          courseYear: student.courseYear,
          graduationYear: student.graduationYear,
          experience: student.experience,
          skills: JSON.stringify(student.skills),
          projects: JSON.stringify(student.projects),
          cvUrl: student.cvUrl,
          certificatesUrl: JSON.stringify(student.certificatesUrl),
          seekingJob: student.seekingJob,
          jobPreferences: JSON.stringify(student.jobPreferences),
        },
        create: {
          userId: studentUser.id,
          cicle: student.cicle,
          specialization: student.specialization,
          courseYear: student.courseYear,
          graduationYear: student.graduationYear,
          experience: student.experience,
          skills: JSON.stringify(student.skills),
          projects: JSON.stringify(student.projects),
          cvUrl: student.cvUrl,
          certificatesUrl: JSON.stringify(student.certificatesUrl),
          seekingJob: student.seekingJob,
          jobPreferences: JSON.stringify(student.jobPreferences),
        },
      });

      const linkedCenterId = centerIdsByEmail[student.centerEmail];
      if (linkedCenterId) {
        await prisma.connection.upsert({
          where: {
            followerId_followingId: {
              followerId: studentUser.id,
              followingId: linkedCenterId,
            },
          },
          update: { status: 'ACTIVE' },
          create: {
            followerId: studentUser.id,
            followingId: linkedCenterId,
            status: 'ACTIVE',
          },
        });
      }

      createdStudentIds.push(studentUser.id);
    }

    // Empresas de ejemplo de Andalucia
    const createdEnterpriseIds = [];

    for (const enterprise of enterprises) {
      const enterpriseUser = await prisma.user.upsert({
        where: { email: enterprise.email },
        update: {
          firstName: enterprise.firstName,
          lastName: enterprise.lastName,
          role: 'EMPRESA',
          status: 'ACTIVO',
          location: `${enterprise.city}, ${enterprise.province}`,
          bio: enterprise.description,
        },
        create: {
          email: enterprise.email,
          password: hashedPassword,
          firstName: enterprise.firstName,
          lastName: enterprise.lastName,
          role: 'EMPRESA',
          status: 'ACTIVO',
          location: `${enterprise.city}, ${enterprise.province}`,
          bio: enterprise.description,
        },
      });

      await prisma.enterpriseProfile.upsert({
        where: { userId: enterpriseUser.id },
        update: {
          companyName: enterprise.companyName,
          industry: enterprise.industry,
          website: enterprise.website,
          employees: enterprise.employees,
          description: enterprise.description,
          city: enterprise.city,
          province: enterprise.province,
        },
        create: {
          userId: enterpriseUser.id,
          companyName: enterprise.companyName,
          industry: enterprise.industry,
          website: enterprise.website,
          employees: enterprise.employees,
          description: enterprise.description,
          city: enterprise.city,
          province: enterprise.province,
        },
      });

      for (const content of enterprise.posts) {
        await ensurePost(enterpriseUser.id, content);
      }

      createdEnterpriseIds.push(enterpriseUser.id);
    }

    // Hacer que todos los alumnos sigan a centros y empresas de demo
    const alumnos = await prisma.user.findMany({
      where: { role: 'ALUMNO', status: 'ACTIVO' },
      select: { id: true },
    });

    for (const alumno of alumnos) {
      // Seguir centros
      for (const centerId of createdCenterIds) {
        await prisma.connection.upsert({
          where: {
            followerId_followingId: {
              followerId: alumno.id,
              followingId: centerId,
            },
          },
          update: { status: 'ACTIVE' },
          create: {
            followerId: alumno.id,
            followingId: centerId,
            status: 'ACTIVE',
          },
        });
      }

      // Seguir empresas
      for (const enterpriseId of createdEnterpriseIds) {
        await prisma.connection.upsert({
          where: {
            followerId_followingId: {
              followerId: alumno.id,
              followingId: enterpriseId,
            },
          },
          update: { status: 'ACTIVE' },
          create: {
            followerId: alumno.id,
            followingId: enterpriseId,
            status: 'ACTIVE',
          },
        });
      }
    }

    logger.info(`✅ Seed completado: ${createdCenterIds.length} centros, ${createdEnterpriseIds.length} empresas, ${createdStudentIds.length} alumnos`);
  } catch (error) {
    logger.error('❌ Error en seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedDatabase();
