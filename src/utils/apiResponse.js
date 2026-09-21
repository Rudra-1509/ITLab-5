/**
 * Standard API Response utilities
 */

class ApiError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data: data !== undefined ? data : {}
  });
};

const sendError = (res, statusCode, code, message, details = null) => {
  const errorObj = {
    code,
    message
  };

  if (details) {
    errorObj.details = details;
  }

  return res.status(statusCode).json({
    success: false,
    error: errorObj
  });
};

module.exports = {
  ApiError,
  sendSuccess,
  sendError
};
