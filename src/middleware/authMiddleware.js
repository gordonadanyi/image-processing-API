const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
    try {
        let token;
    const authHeader = req.headers['authorization'];
        if(!(authHeader && authHeader.startsWith('Bearer '))) {
            return res.status(401).json({ message: 'Authorization header is missing or malformed' });
        }

    token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access token is missing' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
    } catch (error) {
        if(error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Access token has expired' });
        }   
        res.status(401).json({ message: 'Invalid access token' });
    }
};

module.exports = authenticateToken; 