const config = require('./src/config/index')
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const logger = require('./src/utils/logger');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');


const connectMongoose = require('./src/config/db');
const { globalErrorHandler } = require('./src/utils/errorHandler');

const authRoutes = require('./src/routes/authRoutes');
const imageRoutes = require('./src/routes/imageRoutes');

const app = express();
const PORT = config.port;

// ====================== SECURITY & COMMON MIDDLEWARES ======================
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
//app.use(morgan('dev'));   // Change to 'combined' in production
app.use(pinoHttp({ logger }));

// ====================== RATE LIMITING ======================
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later.' }
});

const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30,
    message: { success: false, message: 'Too many uploads. Try again later.' }
});

const transformLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    message: { success: false, message: 'Too many transformations. Try again later.' }
});

// Apply limiters
app.use('/api', generalLimiter);
app.use('/api/images/upload', uploadLimiter);
app.use('/api/images/:id/transform', transformLimiter);

// ====================== ROUTES ======================
app.get('/', (req, res) => {
    req.log.info('Health check endpoint hit');
    res.json({ 
        success: true, 
        message: 'Image Processing API is running 🚀' 
    });
});
// Apply transform limiter specifically (safe way)



app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);



// ====================== ERROR HANDLING ======================
app.use(globalErrorHandler);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Start Server
connectMongoose()
    .then(() => {
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        logger.error({
            msg: 'Failed to connect to MongoDB',
            error: err.message
        });
        process.exit(1);
    });

module.exports = app;