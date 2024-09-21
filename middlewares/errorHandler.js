
const errorHandler = (err, req, res, next) => {
    // Log the error (for development purposes)
    console.error(err.stack);
  
    // Customize response based on the error type
    const statusCode = err.statusCode || 500; // Use specific status code or default to 500 (server error)
    const message = err.message || 'An unexpected error occurred';
  
    res.status(statusCode).json({
      status: 'error',
      statusCode,
      message,
    });
  };
  
  module.exports = errorHandler;
  