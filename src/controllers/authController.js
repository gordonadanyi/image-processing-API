// controllers/authController.js
const authService = require('../services/authService');
const { formatResponse } = require('../utils/response');

const signup = async (req, res) => {
    try {
        const user = await authService.signup(req.body);
        res.status(201).json(formatResponse(true, user, 'User registered successfully'));
    } catch (error) {
        res.status(400).json(formatResponse(false, null, error.message));
    }
};

const login = async (req, res) => {
    try {
        const result = await authService.login(req.body.email, req.body.password);
        res.status(200).json(formatResponse(true, result, 'Login successful'));
    } catch (error) {
        res.status(400).json(formatResponse(false, null, error.message));
    }
};

const refreshToken = async (req, res) => {
    try {
        const result = await authService.refreshAccessToken(req.body.refreshToken);
        res.status(200).json(formatResponse(true, result, 'Token refreshed successfully'));
    } catch (error) {
        res.status(401).json(formatResponse(false, null, error.message));
    }
};

const logout = async (req, res) => {
    try {
        await authService.logout(req.body.refreshToken);
        res.status(200).json(formatResponse(true, null, 'Logged out successfully'));
    } catch (error) {
        res.status(500).json(formatResponse(false, null, 'Logout failed'));
    }
};

const getMe = async (req, res) => {
    res.json(formatResponse(true, { user: req.user }, 'User profile fetched'));
};

module.exports = {
    signup,
    login,
    refreshToken,
    logout,
    getMe
};