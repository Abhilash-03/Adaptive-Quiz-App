import ApiError from "../utils/ApiError.js";

// Handle Mongoose Cast Error (Invalid ObjectId)
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(400, message);
};

// Handle Mongoose Duplicate Key Error
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const message = `${field} already exists`;
  return new ApiError(409, message);
};

// Handle Mongoose Validation Error
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
  }));
  return new ApiError(400, "Validation failed", errors);
};

// Handle JWT Error
const handleJWTError = () => {
  return new ApiError(401, "Invalid token. Please log in again.");
};

// Handle JWT Expired Error
const handleJWTExpiredError = () => {
  return new ApiError(401, "Your token has expired. Please log in again.");
};

// Send Error Response in Development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    errors: err.errors,
    stack: err.stack,
    error: err,
  });
};

// Send Error Response in Production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      errors: err.errors,
    });
  } else {
    // Programming or unknown error: don't leak error details
    console.error("ERROR 💥:", err);
    res.status(500).json({
      success: false,
      status: "error",
      message: "Something went wrong!",
    });
  }
};

// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err.name === "CastError") error = handleCastError(err);
    if (err.code === 11000) error = handleDuplicateKeyError(err);
    if (err.name === "ValidationError") error = handleValidationError(err);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

// Handle 404 - Route Not Found
const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
};

export { errorHandler, notFoundHandler };
