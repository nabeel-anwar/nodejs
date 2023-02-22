module.exports = (err, request, response, next) => {
    err.status = err.status || "error";
    err.statusCode = err.statusCode || 500;
  
    response.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
}