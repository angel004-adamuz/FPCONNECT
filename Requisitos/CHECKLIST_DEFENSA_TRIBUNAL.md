# Checklist Final de Defensa - FPConnect

## 1. Entregables obligatorios
- [ ] Memoria en PDF final revisada (sin faltas y con paginacion correcta).
- [ ] Presentacion (PPTX o PDF) lista para exponer en 12-15 minutos.
- [ ] Recursos anexos accesibles (repositorio, demo, manuales, evidencias).

## 2. Estructura recomendada de la exposicion (12-15 min)
1. Problema y justificacion (1-2 min).
2. Objetivos del proyecto (1 min).
3. Arquitectura y decisiones tecnicas (3-4 min).
4. Demo funcional y resultados (4-5 min).
5. Limitaciones y lineas futuras (1-2 min).
6. Cierre y agradecimiento (30 s).

## 3. Evidencias que conviene abrir en vivo
- `FPConnect_TFG.tex` (estructura completa de memoria).
- `backend/prisma/schema.prisma` (modelo de datos real).
- `backend/src/index.js` (servidor y rutas base).
- `src/pages/LoginPage.jsx` (flujo de acceso y recuperacion).
- `Requisitos/MATRIZ_CUMPLIMIENTO_INTERMODULAR.md` (trazabilidad por modulos).

## 4. Preguntas tipicas del tribunal y respuesta breve
- Por que este stack:
  - Porque permite modularidad, tiempo de desarrollo razonable y cobertura de competencias DAM.
- Que aporta respecto a alternativas:
  - Especializacion en contexto FP y roles diferenciados.
- Como se garantiza seguridad:
  - JWT, hash bcrypt, validacion de entrada y control por rol.
- Que falta para produccion completa:
  - Pruebas de carga automatizadas, observabilidad avanzada y cliente movil nativo.

## 5. Comprobaciones el dia anterior
- [ ] Arranca frontend y backend sin errores.
- [ ] La base de datos responde y migraciones estan aplicadas.
- [ ] La demo de login y flujo principal funciona en directo.
- [ ] La presentacion tiene texto legible y no saturado.
- [ ] Tienes copia local y copia en nube del material.

## 6. Cierre formal sugerido
"Con esto doy por finalizada la exposicion. Muchas gracias por su atencion. Quedo a su disposicion para cualquier pregunta o aclaracion."
