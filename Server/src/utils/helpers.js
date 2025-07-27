// Response helper functions
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const sendError = (res, message = 'Internal Server Error', statusCode = 500, details = null) => {
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details }),
    timestamp: new Date().toISOString()
  });
};

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Generate random ID
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Format date to ISO string
const formatDate = (date = new Date()) => {
  return date.toISOString();
};

module.exports = {
  sendSuccess,
  sendError,
  asyncHandler,
  generateId,
  isValidEmail,
  formatDate
};
