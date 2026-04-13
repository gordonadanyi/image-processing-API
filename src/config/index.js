require('dotenv').config();

const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'REFRESH_SECRET'];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }
});

const config = {
    env: process.env.NODE_ENV || 'development',
    
    port: process.env.PORT || 8000,

    db: {
        uri: process.env.MONGODB_URI,
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        refresh: process.env.REFRESH_SECRET,
    },    
};





module.exports = config;