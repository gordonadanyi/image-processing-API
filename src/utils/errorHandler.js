class AppError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)
    }
}

//global error handler middleware
const globalErrorHandler = (err, req, res) => {
    let error = { ...err }
    error.message = err.message

    //log error for debugging
    console.error('Error:', error)

    //mongoose duplicate key error
    if(error.code === 11000) {
        const field = Object.keys(error.keyValue)[0]
        error = new AppError(`Duplicate field value: ${field}. Please use another value!`, 400)
    }

    //mongoose validation error
    if(error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(el => el.message)
        error = new AppError(`Invalid input data. ${messages.join('. ')}`, 400)
    }

    //JWT error
    if(error.name === 'JsonWebTokenError') {
        error = new AppError('Invalid token. Please log in again!', 401)
    }
    if (error.name === 'TokenExpiredError') {
        error = new AppError('Your token has expired! Please log in again.', 401)
    }

        //send response
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'An unexpected error occurred.',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    })
}

module.exports = {
    AppError,
    globalErrorHandler
}