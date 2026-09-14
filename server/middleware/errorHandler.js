export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected server error occurred.";

  if (statusCode === 500) {
    console.error("Internal Server Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details && { errors: err.details }),
  });
}
