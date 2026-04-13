const mongoose = require('mongoose')
const config = require('../config/index')
const URI = config.db.uri

async function connectMongoose() {
    try {
        const conn = await mongoose.connect(URI, {
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
            retryWrites: true, // Enable retryable writes
            w: 'majority' // Use majority write concern
        })
        console.log(`MongoDB connected: ${conn.connection.host}`)

        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err)
        })

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...')
            setTimeout(connectMongoose, 5000) // Try to reconnect after 5 seconds
        })

        return conn
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message)

        if(URI === 'production'){
            process.exit(1) // Exit in production to avoid unstable state   
        }

        throw error // Rethrow in development for debugging
    }
}

module.exports = connectMongoose