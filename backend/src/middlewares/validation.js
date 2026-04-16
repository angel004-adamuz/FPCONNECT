// Middleware de validación con Joi
import Joi from 'joi';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validación fallida',
        errors: messages,
      });
    }

    req[source] = value;
    next();
  };
};

// Schemas de validación comunes
export const schemas = {
  // Auth
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().max(100).required(),
    lastName: Joi.string().max(100).required(),
    role: Joi.string().valid('ALUMNO', 'CENTRO', 'EMPRESA').required(),
    recoveryQuestion: Joi.string().min(8).max(255).optional(),
    recoveryAnswer: Joi.string().min(2).max(255).optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  recoveryChallenge: Joi.object({
    email: Joi.string().email().required(),
  }),

  recoveryReset: Joi.object({
    email: Joi.string().email().required(),
    recoveryAnswer: Joi.string().min(2).max(255).required(),
    newPassword: Joi.string().min(8).required(),
  }),

  recoveryConfigure: Joi.object({
    recoveryQuestion: Joi.string().min(8).max(255).required(),
    recoveryAnswer: Joi.string().min(2).max(255).required(),
  }),

  // Posts
  createPost: Joi.object({
    content: Joi.string().max(5000).required(),
    imageUrl: Joi.string().uri().optional(),
    visibility: Joi.string().valid('PUBLIC', 'PRIVATE', 'FRIENDS_ONLY').default('PUBLIC'),
  }),

  // Posts
  createPost: Joi.object({
    content: Joi.string().max(5000).required(),
    imageUrl: Joi.string().uri().optional(),
    visibility: Joi.string().valid('PUBLIC', 'PRIVATE', 'FRIENDS_ONLY').optional(),
  }),

  // Comments
  createComment: Joi.object({
    content: Joi.string().max(1000).required(),
  }),

  // Job Offers
  createJobOffer: Joi.object({
    title: Joi.string().max(255).required(),
    description: Joi.string().required(),
    type: Joi.string().valid('PRACTICAS', 'EMPLEO', 'BECA').required(),
    salary: Joi.string().optional(),
    location: Joi.string().required(),
    remote: Joi.boolean().default(false),
  }),

  // User Profile Update
  updateProfile: Joi.object({
    firstName: Joi.string().max(100).optional(),
    lastName: Joi.string().max(100).optional(),
    bio: Joi.string().max(500).optional(),
    location: Joi.string().max(255).optional(),
    profileImage: Joi.string().uri().optional(),
  }),
};
