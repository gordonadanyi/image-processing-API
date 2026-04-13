const express = require('express');
const authRouter = express.Router();
const { signup, login, refreshToken, logout, getMe } = require('../controllers/authController');
const { signupValidator, loginValidator } = require('../utils/validators');
const authenticateToken = require('../middleware/authMiddleware');
const {validate, logoutValidator, refreshValidator}= require('../middleware/validate')


authRouter.post('/signup', signupValidator,validate, signup);
authRouter.post('/login', loginValidator,validate, login);
authRouter.post('/refresh-token',refreshValidator,validate, refreshToken);
authRouter.post('/logout',logoutValidator, validate, logout); 
authRouter.get('/me', authenticateToken, getMe);

module.exports = authRouter;
