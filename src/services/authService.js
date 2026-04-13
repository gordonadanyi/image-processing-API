// services/authService.js
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/index')

class AuthService {

    // Generate Access Token
    generateAccessToken(userId) {
        if (!userId) throw new Error("userId is required");
        return jwt.sign({ id: userId }, config.jwt.secret, { expiresIn: '15m' });
    }

    // Generate Refresh Token
    async generateRefreshToken(userId) {
        if (!userId) throw new Error("userId is required");

        const refreshToken = jwt.sign(
            { id: userId },
            config.jwt.refresh || process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        await RefreshToken.create({
            token: refreshToken,
            user: userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        return refreshToken;
    }

    // Signup Logic
    async signup(userData) {
        const { username, email, password } = userData;

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            throw new Error('Username or email already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        return {
            id: user._id,
            username: user.username,
            email: user.email
        };
    }

    // Login Logic
    async login(email, password) {
        const formattedEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: formattedEmail }).select('+password');
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const accessToken = this.generateAccessToken(user._id);
        const refreshToken = await this.generateRefreshToken(user._id);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        };
    }

    // Refresh Token Logic
    async refreshAccessToken(refreshToken) {
        if (!refreshToken) {
            throw new Error('Refresh token is required');
        }

        const storedToken = await RefreshToken.findOne({ token: refreshToken });
        if (!storedToken) {
            throw new Error('Invalid refresh token');
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || process.env.JWT_SECRET);

        const newAccessToken = this.generateAccessToken(decoded.id);

        return { accessToken: newAccessToken };
    }

    // Logout Logic
    async logout(refreshToken) {
        if (refreshToken) {
            await RefreshToken.deleteOne({ token: refreshToken });
        }
        return { message: 'Logged out successfully' };
    }
}

// Export singleton instance
module.exports = new AuthService();