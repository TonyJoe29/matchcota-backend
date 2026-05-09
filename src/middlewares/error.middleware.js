const notFound = (req, _res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Error interno del servidor.';

  if (error.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Ya existe un registro con esos datos.';
  }

  res.status(statusCode).json({
    error: message,
    details: error.details || undefined
  });
};

module.exports = {
  notFound,
  errorHandler
};
