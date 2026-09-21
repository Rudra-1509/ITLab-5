/**
 * Request Validation Middleware using Zod
 */
const { z } = require('zod');
const { sendError } = require('../utils/apiResponse');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = schema.parse(dataToValidate);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errorMessages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return sendError(res, 400, 'VALIDATION_ERROR', errorMessages, err.errors);
      }
      return sendError(res, 400, 'BAD_REQUEST', 'Invalid request payload');
    }
  };
};

// Common Schemas
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const createRoomSchema = z.object({
  gameId: z.string().optional()
});

const moveSchema = z.object({
  position: z.number().int().min(0).max(8)
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createRoomSchema,
  moveSchema
};
