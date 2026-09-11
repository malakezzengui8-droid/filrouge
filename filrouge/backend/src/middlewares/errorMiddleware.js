function errorHandler(err, req, res, next) {
  console.error(err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || 'Something went wrong on the server'
  });
}

export default errorHandler;