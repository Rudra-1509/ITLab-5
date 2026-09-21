/**
 * Centralized Error Handling Middleware
 * Guarantees uniform error response format across the entire application.
 */
const { ApiError, sendError } = require('../utils/apiResponse');

// 404 Route Handler
const notFoundHandler = (req, res) => {
  return sendError(res, 404, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`);
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.code, err.message, err.details);
  }

  // Handle malformed JSON request bodies
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 400, 'INVALID_JSON', 'Malformed JSON in request body');
  }

  // Default fallback internal server error (500)
  return sendError(
    res,
    500,
    'INTERNAL_SERVER_ERROR',
    process.env.NODE_ENV === 'production' ? 'An unexpected internal error occurred' : err.message
  );
};

module.exports = {
  notFoundHandler,
  errorHandler
};
